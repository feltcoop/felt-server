import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import type {Polka, Request as PolkaRequest, Middleware as PolkaMiddleware} from 'polka';
import bodyParser from 'body-parser';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue} from '@feltcoop/felt/util/terminal.js';
import type ws from 'ws';
import {promisify} from 'util';

import {toAuthenticationMiddleware} from '$lib/session/authenticationMiddleware.js';
import {toAuthorizationMiddleware} from '$lib/session/authorizationMiddleware.js';
import {toLoginMiddleware} from '$lib/session/loginMiddleware.js';
import {toLogoutMiddleware} from '$lib/session/logoutMiddleware.js';
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
import {toCookieSessionMiddleware} from '$lib/session/cookieSession';
import type {CookieSessionRequest} from '$lib/session/cookieSession';
import {toServiceMiddleware} from '$lib/server/serviceMiddleware';
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
	websocketServer: WebsocketServer;
	port?: number;
	db: Database;
	loadInstance?: () => Promise<Polka | null>;
}

export class ApiServer {
	readonly server: HttpServer | HttpsServer;
	readonly app: Polka<Request>;
	readonly websocketServer: WebsocketServer;
	readonly port: number | undefined;
	readonly db: Database;
	readonly loadInstance: () => Promise<Polka | null>;

	constructor(options: Options) {
		this.server = options.server;
		this.app = options.app;
		this.websocketServer = options.websocketServer;
		this.port = options.port;
		this.db = options.db;
		this.loadInstance = options.loadInstance || (async () => null);
		log.info('created');
	}

	isApiServerPathname(pathname: string): boolean {
		return pathname.startsWith('/api/');
	}

	async init(): Promise<void> {
		log.info('initing');

		// TODO refactor to paralleize `init` of the various pieces
		this.websocketServer.on('message', this.handleWebsocketMessage);
		await this.websocketServer.init();

		// Set up the app and its middleware.
		this.app
			.use(bodyParser.json()) // TODO is deprecated, but doesn't let us `import {json}`
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
			.use(toCookieSessionMiddleware())
			.use(toAuthenticationMiddleware(this))
			// API
			.post('/api/v1/login', toLoginMiddleware(this)) // TODO wait shouldn't this fail in Polka's system??
			// TODO we want to support unauthenticated routes so users can publish public content,
			// but for now it's simple and secure to just require an authenticated account for everything
			.use('/api', toAuthorizationMiddleware(this))
			.post('/api/v1/logout', toLogoutMiddleware(this))
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
		const instance = await this.loadInstance();
		if (instance) {
			this.app.use(instance.handler);
		}

		// Start the app.
		const port = this.port || 3001;
		// While building for production, `render` will be falsy
		// and we want to use 3001 while building for prod.
		// TODO maybe always default to env var `PORT`, upstream and instantiate `ApiServer` with it
		// (instance && !dev
		// 	? toEnvNumber('PORT', API_SERVER_DEFAULT_PORT_PROD)
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
		this.websocketServer.off('message', this.handleWebsocketMessage);
		await Promise.all([
			this.websocketServer.close(),
			this.db.close(),
			promisify(this.app.server.close).call(this.app.server),
		]);
	}

	handleWebsocketMessage = async (_socket: ws, rawMessage: ws.Data, account_id: number) => {
		if (typeof rawMessage !== 'string') {
			console.error(
				'[handleWebsocketMessage] cannot handle websocket message; currently only supports strings',
			);
			return;
		}

		let message: any; // TODO type
		try {
			message = JSON.parse(rawMessage);
		} catch (err) {
			console.error('[handleWebsocketMessage] failed to parse message', err);
			return;
		}
		console.log('[handleWebsocketMessage]', message);
		if (!(message as any)?.type) {
			// TODO proper automated validation
			console.error('[handleWebsocketMessage] invalid message', message);
			return;
		}
		const service = services.get(message.type);
		if (!service) {
			console.error('[handleWebsocketMessage] unhandled message type', message.type);
			return;
		}

		const response = await service.handle(this, message.params, account_id);

		// TODO what should the API for returning/broadcasting responses be?
		const serializedResponse = JSON.stringify({
			type: 'service_response',
			messageType: message.type,
			response,
		});
		for (const client of this.websocketServer.wss.clients) {
			client.send(serializedResponse);
		}
	};
}

export interface HandleWebsocketMessage {
	(server: ApiServer, socket: ws, rawMessage: ws.Data, account_id: number): Promise<void>;
}
