import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import cookieSession from 'cookie-session';
import type {CookieSessionRequest, CookieSessionObject} from 'cookie-session';
import type {Polka, Request as PolkaRequest, Middleware as PolkaMiddleware} from 'polka';
import bodyParser from 'body-parser';
import send from '@polka/send-type';
import {Logger} from '@feltcoop/gro';
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
import {toEnvNumber} from '@feltcoop/gro/dist/utils/env.js';
import ws from 'ws';
import type {Assignable} from '@feltcoop/gro';

import {toSessionAccountMiddleware} from '../session/sessionAccountMiddleware.js';
import {toLoginMiddleware} from '../session/loginMiddleware.js';
import {toLogoutMiddleware} from '../session/logoutMiddleware.js';
import {
	toCommunityMiddleware,
	toCommunitiesMiddleware,
} from '../communities/communityMiddleware.js';
import type {Account} from '../vocab/account/account.js';
import type {Database} from '../db/Database.js';

const log = new Logger([blue('[ApiServer]')]);

// TODO not sure what these types should look like in their final form,
// there's currently some redundancy and weirdness
export interface Request extends PolkaRequest, CookieSessionRequest {
	account?: Account;
	session: ServerSession;
}
export interface Middleware extends PolkaMiddleware<Request> {}
export interface ServerSession extends CookieSessionObject {
	name?: string;
}

const dev = process.env.NODE_ENV !== 'production';

const TODO_SERVER_COOKIE_KEYS = ['TODO', 'KEY_2_TODO', 'KEY_3_TODO'];

export interface Options {
	server: HttpServer | HttpsServer;
	app: Polka<Request>;
	port?: number;
	db: Database;
	loadRender?: () => Promise<RenderSvelteKit | null>;
}

export interface RenderSvelteKit {
	<TContext>(request: SvelteKitRequest<TContext>): SvelteKitResponse | Promise<SvelteKitResponse>;
}

export class ApiServer {
	readonly server: HttpServer | HttpsServer;
	readonly app: Polka<Request>;
	readonly wss!: ws.Server;
	readonly port: number | undefined;
	readonly db: Database;
	readonly loadRender: () => Promise<RenderSvelteKit | null>;

	constructor(options: Options) {
		this.server = options.server;
		this.app = options.app;
		this.port = options.port;
		this.db = options.db;
		this.loadRender = options.loadRender || (async () => null);
		log.info('created');
	}

	isApiServerPathname(pathname: string): boolean {
		return pathname.startsWith('/api/');
	}

	async init(): Promise<void> {
		log.info('initing');

		// TODO I'm not sure about this way of creating the server externally and passing it to both polka and ws
		// const wss = new ws.Server({server: this.server}); // port: 3000
		const wss = new ws.Server({port: 3002, path: '/ws'}); // TODO
		console.log('wss.on', wss.on);
		(this as Assignable<{wss: ws.Server}, 'wss'>).wss = wss;
		wss.on('connection', (socket, req) => {
			console.log('[wss] connection req.url', req.url);
			console.log('[wss] connection req.user', (req as any).user);
			console.log('[wss] connection req.headers', req.headers);
			console.log('wss.clients.size', wss.clients.size);
			socket.on('message', (rawMessage) => {
				let message;
				try {
					message = JSON.parse(rawMessage as any);
				} catch (err) {
					console.error('bad message', err, 'do not move and they cannot see you');
				}
				console.log('[wss] message', message);
				if (message.type === 'Create') {
					console.log('create!!!');
					// TODO automate all of this
					const finalMessage = {...message, attributedTo: '$yourname'};
					const serialized = JSON.stringify(finalMessage);
					for (const client of wss.clients) {
						client.send(serialized);
					}
				}
			});
			socket.on('open', () => {
				console.log('[wss] open');
			});
			socket.on('close', (code, reason) => {
				console.log('[wss] close', code, reason);
			});
			socket.on('error', (err) => {
				console.error('[wss] error', err);
			});
			console.log('[server] saying hi');
			socket.send(
				// the client should understand ActivityStreams vocabulary:
				JSON.stringify({
					type: 'Create',
					attributedTo: 'the_server',
					object: {type: 'Chat', content: 'hihi'},
				}),
			);
		});
		wss.on('close', () => {
			console.log('[wss] close');
		});
		wss.on('error', (error) => {
			console.log('[wss] error', error);
		});
		wss.on('headers', (headers, req) => {
			// TODO could parse cookies from these headers if we don't connect the `ws.Server` to the `server` above
			console.log('[wss] headers', headers);
			console.log('[wss] req.url, req.headers', req.url, req.headers);
		});

		// Set up the app and its middleware.
		this.app
			.use(bodyParser.json()) // TODO is deprecated, but doesn't let us `import {json}`
			.use((req, _res, next) => {
				// TODO proper logger
				log.trace('req', {url: req.url, query: req.query, params: req.params, body: req.body});
				next();
			})
			.use(
				cookieSession({
					keys: TODO_SERVER_COOKIE_KEYS,
					maxAge: 1000 * 60 * 60 * 24 * 7 * 6, // 6 weeks
					secure: !dev, // this makes cookies break in prod unless https! see letsencrypt
					sameSite: dev ? 'lax' : false,
					name: 'session_id',
				}),
			)
			.use(toSessionAccountMiddleware(this))
			// API
			.post('/api/v1/echo', (req, res) => {
				log.info('echo', req.body);
				send(res, 200, req.body);
			})
			.get('/api/v1/context', (req, res) => {
				send(res, 200, toClientContext(req));
			})
			.post('/api/v1/login', toLoginMiddleware(this))
			.post('/api/v1/logout', toLogoutMiddleware(this))
			.get('/api/v1/communities', toCommunitiesMiddleware(this))
			.get('/api/v1/communities/:community_id', toCommunityMiddleware(this));

		// TODO gro filer middleware (and needs to go after auth)

		// SvelteKit Node adapter, adapted to our production API server
		// TODO needs a lot of work, especially for production
		const render = await this.loadRender();
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
			this.port ||
			// While building for production, `render` will be falsy
			// and we want to use 3001 while building for prod.
			// TODO maybe always default to env var `PORT`, upstream and instantiate `ApiServer` with it
			(render && !dev
				? toEnvNumber('PORT', API_SERVER_DEFAULT_PORT_PROD)
				: API_SERVER_DEFAULT_PORT_DEV);
		// TODO Gro utility to get next good port
		// (wait no that doesn't work, static proxy, hmm... can fix when we switch frontend to Gro)
		await new Promise<void>((resolve) => {
			this.app.listen(port, () => {
				log.info(`listening on localhost:${port}`);
				resolve();
			});
		});

		log.info('inited');
	}

	async close(): Promise<void> {
		log.info('close');
		this.wss.close(); // TODO do we need to await this?
		await Promise.all([
			this.db.close(),
			new Promise((resolve, reject) =>
				// TODO remove type casting when polka types are fixed
				((this.app.server as any) as Server).close((err) => (err ? resolve : reject(err))),
			),
		]);
	}
}

const toClientContext = (req: Request): ClientContext =>
	req.account ? {account: req.account} : {guest: true};
export type ClientContext = ClientAccountContext | ClientGuestContext;
export interface ClientAccountContext {
	account: Account;
	guest?: false;
}
export interface ClientGuestContext {
	guest: true;
	error?: Error;
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const noop_handler = (_req: any, _res: any, next: () => void) => next();
const paths = {
	assets: join(__dirname, `../assets`),
	prerendered: join(__dirname, `../prerendered`),
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
