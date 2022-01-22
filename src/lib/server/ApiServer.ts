import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import type {Polka, Request as PolkaRequest, Middleware as PolkaMiddleware} from 'polka';
import bodyParser from 'body-parser';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue} from '@feltcoop/felt/util/terminal.js';
import {promisify} from 'util';

import {toAuthenticationMiddleware} from '$lib/session/authenticationMiddleware.js';
import {toAuthorizationMiddleware} from '$lib/session/authorizationMiddleware.js';
import type {Database} from '$lib/db/Database.js';
import type {WebsocketServer} from '$lib/server/WebsocketServer.js';
import {toCookieSessionMiddleware} from '$lib/session/cookieSession';
import type {CookieSessionRequest} from '$lib/session/cookieSession';
import type {Service} from '$lib/server/service';
import {toServiceMiddleware} from '$lib/server/serviceMiddleware';
import {websocketHandler} from '$lib/server/websocketHandler';

const log = new Logger([blue('[ApiServer]')]);

// similar but not identical to `WebsocketServerRequest`
export interface ApiServerRequest extends PolkaRequest, CookieSessionRequest {
	account_id?: number;
}
export interface Middleware extends PolkaMiddleware<ApiServerRequest> {}

export interface Options {
	server: HttpServer | HttpsServer;
	app: Polka<ApiServerRequest>;
	websocketServer: WebsocketServer;
	port: number;
	db: Database;
	services: Map<string, Service<any, any>>;
}

export class ApiServer {
	readonly server: HttpServer | HttpsServer;
	readonly app: Polka<ApiServerRequest>;
	readonly websocketServer: WebsocketServer;
	readonly port: number;
	readonly db: Database;
	readonly services: Map<string, Service<any, any>>;

	websocketListener = websocketHandler.bind(null, this);

	constructor(options: Options) {
		this.server = options.server;
		this.app = options.app;
		this.websocketServer = options.websocketServer;
		this.port = options.port;
		this.db = options.db;
		this.services = options.services;
		log.info('created');
	}

	isApiServerPathname(pathname: string): boolean {
		return pathname.startsWith('/api/');
	}

	async init(): Promise<void> {
		log.info('initing');

		// TODO refactor to paralleize `init` of the various pieces
		this.websocketServer.on('message', this.websocketListener);
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
			// TODO we want to support unauthenticated routes so users can publish public content,
			// but for now it's simple and secure to just require an authenticated account for everything
			.use('/api', toAuthorizationMiddleware(this));

		// Register services as http routes.
		for (const service of this.services.values()) {
			this.app.add(
				service.event.route!.method,
				service.event.route!.path,
				toServiceMiddleware(this, service),
			);
		}

		// SvelteKit Node adapter, adapted to our production API server
		if (process.env.NODE_ENV === 'production') {
			const importPath = '../../../svelte-kit/middlewares.js';
			let sveltekitMiddlewaresModule: any;
			try {
				sveltekitMiddlewaresModule = await import(importPath);
			} catch (err) {
				throw Error(`Failed to import SvelteKit adapter-node middlewares: ${importPath} -- ${err}`);
			}
			const {assetsMiddleware, prerenderedMiddleware, kitMiddleware} = sveltekitMiddlewaresModule;
			this.app.use(assetsMiddleware, prerenderedMiddleware, kitMiddleware);
		}

		// Start the app.
		await new Promise<void>((resolve) => {
			this.app.listen(this.port, () => {
				log.info(`listening on localhost:${this.port}`);
				resolve();
			});
		});

		log.info('inited');
	}

	async close(): Promise<void> {
		log.info('close');
		this.websocketServer.off('message', this.websocketListener);
		await Promise.all([
			this.websocketServer.close(),
			this.db.close(),
			promisify(this.app.server.close).call(this.app.server),
		]);
	}
}
