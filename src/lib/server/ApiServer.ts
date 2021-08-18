import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import cookie_session from 'cookie-session';
import type {CookieSessionRequest, CookieSessionObject} from 'cookie-session';
import type {Polka, Request as PolkaRequest, Middleware as PolkaMiddleware} from 'polka';
import body_parser from 'body-parser';
import send from '@polka/send-type';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue} from '@feltcoop/felt/util/terminal.js';

import {to_session_account_middleware} from '$lib/session/session_account_middleware.js';
import {to_login_middleware} from '$lib/session/login_middleware.js';
import {to_logout_middleware} from '$lib/session/logout_middleware.js';
import {
	to_community_middleware,
	to_communities_middleware,
	to_create_community_middleware,
	to_create_member_middleware,
} from '$lib/communities/community_middleware.js';
import {to_posts_middleware, to_create_post_middleware} from '$lib/posts/post_middleware.js';
import {
	to_space_middleware,
	to_spaces_middleware,
	to_create_space_middleware,
} from '$lib/spaces/space_middleware.js';
import type {AccountSession} from '$lib/session/client_session.js';
import type {Database} from '$lib/db/Database.js';
import type {WebsocketServer} from '$lib/server/WebsocketServer.js';

const log = new Logger([blue('[ApiServer]')]);

// TODO not sure what these types should look like in their final form,
// there's currently some redundancy and weirdness
export interface Request extends PolkaRequest, CookieSessionRequest {
	account_session?: AccountSession;
	session: ServerSession;
}
export interface Middleware extends PolkaMiddleware<Request> {}
export interface ServerSession extends CookieSessionObject {
	account_id?: number;
}

const dev = process.env.NODE_ENV !== 'production';

const TODO_SERVER_COOKIE_KEYS = ['TODO', 'KEY_2_TODO', 'KEY_3_TODO'];

export interface Options {
	server: HttpServer | HttpsServer;
	app: Polka<Request>;
	websocket_server: WebsocketServer;
	port?: number;
	db: Database;
	load_instance?: () => Promise<Polka | null>;
}

export class ApiServer {
	readonly server: HttpServer | HttpsServer;
	readonly app: Polka<Request>;
	readonly websocket_server: WebsocketServer;
	readonly port: number | undefined;
	readonly db: Database;
	readonly load_instance: () => Promise<Polka | null>;

	constructor(options: Options) {
		this.server = options.server;
		this.app = options.app;
		this.websocket_server = options.websocket_server;
		this.port = options.port;
		this.db = options.db;
		this.load_instance = options.load_instance || (async () => null);
		log.info('created');
	}

	is_api_server_pathname(pathname: string): boolean {
		return pathname.startsWith('/api/');
	}

	async init(): Promise<void> {
		log.info('initing');

		// TODO refactor to paralleize `init` of the various pieces
		await this.websocket_server.init();

		// Set up the app and its middleware.
		this.app
			.use(body_parser.json()) // TODO is deprecated, but doesn't let us `import {json}`
			.use((req, _res, next) => {
				// TODO proper logger
				log.trace('req', {url: req.url, query: req.query, params: req.params, body: req.body});
				next();
			})
			.use(
				cookie_session({
					keys: TODO_SERVER_COOKIE_KEYS,
					maxAge: 1000 * 60 * 60 * 24 * 7 * 6, // 6 weeks
					secure: false, // this should be `dev!` but we need https in prod first
					sameSite: dev ? 'lax' : false,
					name: 'session_id',
				}),
			)
			.use(to_session_account_middleware(this))
			// API
			.post('/api/v1/echo', (req, res) => {
				log.info('echo', req.body);
				send(res, 200, req.body);
			})
			.post('/api/v1/login', to_login_middleware(this))
			.post('/api/v1/logout', to_logout_middleware(this))
			// TODO replace these with a single resource middleware
			.get('/api/v1/communities', to_communities_middleware(this))
			.post('/api/v1/communities', to_create_community_middleware(this))
			.get('/api/v1/communities/:community_id', to_community_middleware(this))
			.post('/api/v1/communities/:community_id/spaces', to_create_space_middleware(this))
			.get('/api/v1/communities/:community_id/spaces', to_spaces_middleware(this))
			.get('/api/v1/spaces/:space_id', to_space_middleware(this))
			.post('/api/v1/spaces/:space_id/posts', to_create_post_middleware(this))
			.get('/api/v1/spaces/:space_id/posts', to_posts_middleware(this))
			.post('/api/v1/members', to_create_member_middleware(this));

		// TODO gro filer middleware (and needs to go after auth)

		// SvelteKit Node adapter, adapted to our production API server
		// TODO needs a lot of work, especially for production
		const instance = await this.load_instance();
		if (instance) {
			this.app.use(instance.handler);
		}

		// Start the app.
		const port = this.port || 3001;
		// While building for production, `render` will be falsy
		// and we want to use 3001 while building for prod.
		// TODO maybe always default to env var `PORT`, upstream and instantiate `ApiServer` with it
		// (instance && !dev
		// 	? to_env_number('PORT', API_SERVER_DEFAULT_PORT_PROD)
		// 	: API_SERVER_DEFAULT_PORT_DEV);
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
		await Promise.all([
			this.websocket_server.close(),
			this.db.close(),
			new Promise((resolve, reject) =>
				// TODO remove type casting when polka types are fixed
				(this.app.server as any as HttpServer).close((err) => (err ? resolve : reject(err))),
			),
		]);
	}
}
