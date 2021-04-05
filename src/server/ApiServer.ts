import polka from 'polka';
import cookieSession from 'cookie-session';
import type {CookieSessionRequest, CookieSessionObject} from 'cookie-session';
import type {
	Polka,
	Request as PolkaRequest,
	Middleware as PolkaMiddleware,
	IOptions as PolkaOptions,
} from 'polka';
import bodyParser from 'body-parser';
import send from '@polka/send-type';
import {Logger} from '@feltcoop/gro/dist/utils/log.js';
import {blue} from '@feltcoop/gro/dist/utils/terminal.js';
import sirv from 'sirv';
import {dirname, join} from 'path';
import {get_body} from '@sveltejs/kit/http';
import {URL, fileURLToPath} from 'url';
import {existsSync} from 'fs';
import type {Request as SvelteKitRequest, Response as SvelteKitResponse} from '@sveltejs/kit';
import type {Server} from 'net';
import {
	API_SERVER_DEFAULT_PORT_DEV,
	API_SERVER_DEFAULT_PORT_PROD,
} from '@feltcoop/gro/dist/config/defaultBuildConfig.js';
import {SVELTE_KIT_DIST_PATH} from '@feltcoop/gro/dist/paths.js';
import {numberFromEnv} from '@feltcoop/gro/dist/utils/env.js';

import {toAttachSessionUserMiddleware} from '../session/attachSessionUserMiddleware.js';
import {toLoginMiddleware} from '../session/loginMiddleware.js';
import {toLogoutMiddleware} from '../session/logoutMiddleware.js';
import type {User} from '../vocab/user/user.js';
import {db} from '../db/db.js';

const log = new Logger([blue('[ApiServer]')]);

// TODO not sure what these types should look like in their final form,
// there's currently some redundancy and weirdness
export interface ServerApp extends Polka<Request> {}
export interface Request extends PolkaRequest, CookieSessionRequest {
	user?: User;
	session: ServerSession;
}
export interface Middleware extends PolkaMiddleware<Request> {}
export interface ServerSession extends CookieSessionObject {
	name?: string;
}

const dev = process.env.NODE_ENV !== 'production';

const TODO_SERVER_COOKIE_KEYS = ['TODO', 'KEY_2_TODO', 'KEY_3_TODO'];

export interface ApiServerConfig {
	port?: number;
	polka?: PolkaOptions<Request> | undefined;
	loadRender?: () => Promise<RenderSvelteKit | null>;
}

export interface RenderSvelteKit {
	<TContext>(request: SvelteKitRequest<TContext>): SvelteKitResponse | Promise<SvelteKitResponse>;
}

// TODO review all of this before deploying to production

export class ApiServer {
	readonly app: ServerApp;
	readonly db = db;

	constructor(public readonly config: ApiServerConfig) {
		this.app = polka(config.polka);
		log.info('created');
	}

	isApiServerPathname(pathname: string): boolean {
		return pathname.startsWith('/api/');
	}

	async init(): Promise<void> {
		log.info('initing');

		// Set up the app and its middleware.
		this.app
			.use(bodyParser.json()) // TODO is deprecated, but doesn't let us `import {json}`
			.use((req, _res, next) => {
				// TODO proper logger
				log.trace('req', {url: req.url, query: req.query, params: req.params, body: req.body});
				next();
			})
			// .use(config.render ? (Function.prototype as any) : (Function.prototype as any)) // TODO
			.use(
				cookieSession({
					keys: TODO_SERVER_COOKIE_KEYS,
					maxAge: 1000 * 60 * 60 * 24 * 7 * 6, // 6 weeks
					secure: !dev, // this makes cookies break in prod unless https! see letsencrypt
					sameSite: dev ? 'lax' : false,
					name: 'session_id',
				}),
			)
			.use(toAttachSessionUserMiddleware(this))
			// API
			.post('/api/v1/echo', (req, res) => {
				log.info('echo', req.body);
				send(res, 200, req.body);
			})
			.get('/api/v1/context', (req, res) => {
				send(res, 200, toClientContext(req));
			})
			.post('/api/v1/login', toLoginMiddleware(this))
			.post('/api/v1/logout', toLogoutMiddleware(this));

		// TODO gro filer middleware (and needs to go after auth)

		// SvelteKit Node adapter, adapted to our production API server
		// TODO needs a lot of work, especially for production
		const render = this.config.loadRender && (await this.config.loadRender());
		if (render) {
			this.app.use(
				// compression({threshold: 0}), // TODO
				assets_handler,
				prerendered_handler,
				async (req, res, next) => {
					const parsed = new URL(req.url || '', 'http://localhost');
					if (this.isApiServerPathname(parsed.pathname)) return next();
					const rendered = await render({
						method: req.method,
						headers: req.headers, // TODO: what about repeated headers, i.e. string[]
						path: parsed.pathname,
						body: await get_body(req),
						query: parsed.searchParams,
					} as any); // TODO why the type casting?

					if (rendered) {
						res.writeHead(rendered.status!, rendered.headers); // TODO can it be undefined?
						res.end(rendered.body);
					} else {
						res.statusCode = 404;
						res.end('Not found');
					}
				},
			);
		}

		// Start the app.
		const port =
			this.config.port ??
			(render || !dev
				? numberFromEnv('PORT', API_SERVER_DEFAULT_PORT_PROD)
				: API_SERVER_DEFAULT_PORT_DEV);
		await Promise.all([
			this.db.init(),
			// TODO Gro utility to get next good port
			// (wait no that doesn't work, static proxy, hmm... can fix when we switch frontend to Gro)
			new Promise<void>((resolve) => {
				this.app.listen(port, () => {
					log.info(`listening on localhost:${port}`);
					resolve();
				});
			}),
		]);
		log.info('inited');
	}

	async destroy(): Promise<void> {
		await Promise.all([
			this.db.destroy(),
			new Promise((resolve, reject) =>
				// TODO remove type casting when polka types are fixed
				((this.app.server as any) as Server).close((err) => (err ? resolve : reject(err))),
			),
		]);
	}
}

const toClientContext = (req: Request): ClientContext =>
	req.user ? {user: req.user} : {guest: true};
export type ClientContext = ClientUserContext | ClientGuestContext;
export interface ClientUserContext {
	user: User;
	guest?: false;
}
export interface ClientGuestContext {
	guest: true;
	error?: Error;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const noop_handler = (_req: any, _res: any, next: () => void) => next();
const paths = {
	assets: join(__dirname, `../${SVELTE_KIT_DIST_PATH}/assets`),
	prerendered: join(__dirname, `../${SVELTE_KIT_DIST_PATH}/prerendered`),
};

const mutable = (dir: string) =>
	sirv(dir, {
		etag: true,
		maxAge: 0,
	});

const prerendered_handler = existsSync(paths.prerendered)
	? mutable(paths.prerendered)
	: noop_handler;

const assets_handler = existsSync(paths.assets)
	? sirv(paths.assets, {
			maxAge: 31536000,
			immutable: true,
	  })
	: noop_handler;
