import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import type {Polka, Request as PolkaRequest, Middleware as PolkaMiddleware} from 'polka';
import bodyParser from 'body-parser';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue} from '@feltcoop/felt/util/terminal.js';
import {promisify} from 'util';

import {toAuthenticationMiddleware} from '$lib/session/authenticationMiddleware.js';
import {toAuthorizationMiddleware} from '$lib/session/authorizationMiddleware.js';
import {toLoginMiddleware} from '$lib/session/loginMiddleware.js';
import {toLogoutMiddleware} from '$lib/session/logoutMiddleware.js';
import type {Database} from '$lib/db/Database.js';
import type {WebsocketServer} from '$lib/server/WebsocketServer.js';
import {toCookieSessionMiddleware} from '$lib/session/cookieSession';
import type {CookieSessionRequest} from '$lib/session/cookieSession';
import type {Service} from '$lib/server/service';
import {toServiceMiddleware} from '$lib/server/serviceMiddleware';
import {websocketHandler} from '$lib/server/websocketHandler';

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
	port: number;
	db: Database;
	services: Map<string, Service<any, any>>;
}

export class ApiServer {
	readonly server: HttpServer | HttpsServer;
	readonly app: Polka<Request>;
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
			// API
			.post('/api/v1/login', toLoginMiddleware(this)) // TODO wait shouldn't this fail in Polka's system??
			// TODO we want to support unauthenticated routes so users can publish public content,
			// but for now it's simple and secure to just require an authenticated account for everything
			.use('/api', toAuthorizationMiddleware(this))
			.post('/api/v1/logout', toLogoutMiddleware(this));

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
			// TODO this is a hack to make Rollup not bundle this - maybe configure to exclude it instead?
			// The SvelteKit Node adapter does this here:
			// https://github.com/sveltejs/kit/blob/101ab08197a2d7bab7eb2a14515ec548f577a618/packages/adapter-node/index.js#L87
			const importPath = '../../../svelte-kit/' + 'middlewares.js';
			try {
				const {assetsMiddleware, prerenderedMiddleware, kitMiddleware} = (await import(
					importPath
				)) as any;
				this.app.use(assetsMiddleware, prerenderedMiddleware, kitMiddleware);
			} catch (err) {
				// TODO this fails during build, but is that a problem?
				console.error(
					`Failed to import SvelteKit adapter-node middlewares: ${importPath} -- ${err}`,
				);
			}
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
