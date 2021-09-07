import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import type {Polka, Request as PolkaRequest, Middleware as PolkaMiddleware} from 'polka';
import body_parser from 'body-parser';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue} from '@feltcoop/felt/util/terminal.js';

import {to_authentication_middleware} from '$lib/session/authentication_middleware.js';
import {to_authorization_middleware} from '$lib/session/authorization_middleware.js';
import {to_login_middleware} from '$lib/session/login_middleware.js';
import {to_logout_middleware} from '$lib/session/logout_middleware.js';
import {
	to_community_middleware,
	to_communities_middleware,
	to_create_member_middleware,
	create_community_service,
} from '$lib/vocab/community/community_middleware.js';
import {to_files_middleware, to_create_file_middleware} from '$lib/vocab/file/fileMiddleware.js';
import {
	to_space_middleware,
	to_spaces_middleware,
	to_create_space_middleware,
} from '$lib/vocab/space/space_middleware.js';
import type {ClientAccountSession} from '$lib/session/client_session.js';
import type {Database} from '$lib/db/Database.js';
import type {WebsocketServer} from '$lib/server/WebsocketServer.js';
import {to_cookie_session_middleware} from '$lib/session/cookie_session';
import type {CookieSessionRequest} from '$lib/session/cookie_session';
import {to_service_middleware} from '$lib/server/service_middleware';

const log = new Logger([blue('[ApiServer]')]);

// TODO not sure what these types should look like in their final form,
// there's currently some redundancy and weirdness
export interface Request extends PolkaRequest, CookieSessionRequest {
	account_session?: ClientAccountSession;
}
export interface Middleware extends PolkaMiddleware<Request> {}

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
				// TODO proper logger, also don't log sensitive info in prod
				log.trace('req', {
					method: req.method,
					url: req.url,
					query: req.query,
					params: req.params,
					body: req.body,
				});
				next();
			})
			.use(to_cookie_session_middleware())
			.use(to_authentication_middleware(this))
			// API
			.post('/api/v1/login', to_login_middleware(this)) // TODO wait shouldn't this fail in Polka's system??
			// TODO we want to support unauthenticated routes so users can publish public content,
			// but for now it's simple and secure to just require an authenticated account for everything
			.use('/api', to_authorization_middleware(this))
			.post('/api/v1/logout', to_logout_middleware(this))
			.get('/api/v1/communities', to_communities_middleware(this))
			.post('/api/v1/communities', to_service_middleware(this, create_community_service))
			.get('/api/v1/communities/:community_id', to_community_middleware(this))
			.post('/api/v1/communities/:community_id/spaces', to_create_space_middleware(this))
			.get('/api/v1/communities/:community_id/spaces', to_spaces_middleware(this))
			.get('/api/v1/spaces/:space_id', to_space_middleware(this))
			.post('/api/v1/spaces/:space_id/files', to_create_file_middleware(this))
			.get('/api/v1/spaces/:space_id/files', to_files_middleware(this))
			.post('/api/v1/members', to_create_member_middleware(this));

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
