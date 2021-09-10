import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import type {Polka, Request as PolkaRequest, Middleware as PolkaMiddleware} from 'polka';
import body_parser from 'body-parser';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue} from '@feltcoop/felt/util/terminal.js';
import type ws from 'ws';

import {to_authentication_middleware} from '$lib/session/authentication_middleware.js';
import {to_authorization_middleware} from '$lib/session/authorization_middleware.js';
import {to_login_middleware} from '$lib/session/login_middleware.js';
import {to_logout_middleware} from '$lib/session/logout_middleware.js';
import {
	readCommunityService,
	readCommunitiesService,
	createMemberService,
	createCommunityService,
} from '$lib/vocab/community/communityServices.js';
import {readFilesService, createFileService} from '$lib/vocab/file/fileServices.js';
import {
	readSpaceService,
	readSpacesService,
	createSpaceService,
} from '$lib/vocab/space/spaceServices.js';
import type {Database} from '$lib/db/Database.js';
import type {WebsocketServer} from '$lib/server/WebsocketServer.js';
import {to_cookie_session_middleware} from '$lib/session/cookie_session';
import type {CookieSessionRequest} from '$lib/session/cookie_session';
import {toServiceMiddleware} from '$lib/server/service_middleware';
import {services} from '$lib/server/services';

const log = new Logger([blue('[ApiServer]')]);

// TODO not sure what these types should look like in their final form,
// there's currently some redundancy and weirdness
export interface Request extends PolkaRequest, CookieSessionRequest {
	account_id?: number;
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
		this.websocket_server.on('message', this.handle_websocket_message);
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
			.get('/api/v1/communities', toServiceMiddleware(this, readCommunitiesService))
			.post('/api/v1/communities', toServiceMiddleware(this, createCommunityService))
			.get('/api/v1/communities/:community_id', toServiceMiddleware(this, readCommunityService))
			.post(
				'/api/v1/communities/:community_id/spaces',
				toServiceMiddleware(this, createSpaceService),
			)
			.get('/api/v1/communities/:community_id/spaces', toServiceMiddleware(this, readSpacesService))
			.get('/api/v1/spaces/:space_id', toServiceMiddleware(this, readSpaceService))
			.post('/api/v1/spaces/:space_id/files', toServiceMiddleware(this, createFileService))
			.get('/api/v1/spaces/:space_id/files', toServiceMiddleware(this, readFilesService))
			.post('/api/v1/members', toServiceMiddleware(this, createMemberService));

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
		this.websocket_server.off('message', this.handle_websocket_message);
		await Promise.all([
			this.websocket_server.close(),
			this.db.close(),
			new Promise((resolve, reject) =>
				// TODO remove type casting when polka types are fixed
				(this.app.server as any as HttpServer).close((err) => (err ? resolve : reject(err))),
			),
		]);
	}

	handle_websocket_message = async (_socket: ws, raw_message: ws.Data, account_id: number) => {
		if (typeof raw_message !== 'string') {
			console.error(
				'[handle_websocket_message] cannot handle websocket message; currently only supports strings',
			);
			return;
		}

		let message: any; // TODO type
		try {
			message = JSON.parse(raw_message);
		} catch (err) {
			console.error('[handle_websocket_message] failed to parse message', err);
			return;
		}
		console.log('[handle_websocket_message]', message);
		if (!(message as any)?.type) {
			// TODO proper automated validation
			console.error('[handle_websocket_message] invalid message', message);
			return;
		}
		const service = services.get(message.type);
		if (!service) {
			console.error('[handle_websocket_message] unhandled message type', message.type);
			return;
		}

		const response = await service.handle(this, message.params, account_id);

		// TODO what should the API for returning/broadcasting responses be?
		const serialized_response = JSON.stringify({
			type: 'service_response',
			message_type: message.type,
			response,
		});
		for (const client of this.websocket_server.wss.clients) {
			client.send(serialized_response);
		}
	};
}

export interface HandleWebsocketMessage {
	(server: ApiServer, socket: ws, raw_message: ws.Data, account_id: number): Promise<void>;
}
