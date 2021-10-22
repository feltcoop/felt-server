import ws from 'ws';
import {promisify} from 'util';
import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import {EventEmitter} from 'events';
import type StrictEventEmitter from 'strict-event-emitter-types';

import type {CookieSessionIncomingMessage} from '$lib/session/cookieSession';
import {toCookieSessionMiddleware} from '$lib/session/cookieSession';

type WebsocketServerEmitter = StrictEventEmitter<EventEmitter, WebsocketServerEvents>;
interface WebsocketServerEvents {
	message: (socket: ws, message: ws.Data, account_id: number) => void;
}

const cookieSessionMiddleware = toCookieSessionMiddleware();

export class WebsocketServer extends (EventEmitter as {new (): WebsocketServerEmitter}) {
	readonly wss: ws.Server;
	readonly server: HttpServer | HttpsServer;

	constructor(server: HttpServer | HttpsServer) {
		super();
		this.server = server;
		this.wss = new ws.Server({server});
	}

	async init(): Promise<void> {
		const {wss} = this;
		wss.on('connection', (socket, req: CookieSessionIncomingMessage) => {
			console.log('[wss] connection req.url', req.url, wss.clients.size);
			console.log('[wss] connection req.headers', req.headers);
			cookieSessionMiddleware(req, {}, () => {});
			const account_id = req.session?.account_id;
			if (account_id === undefined) {
				console.log('[wss] request to open connection was unauthenticated');
				socket.close();
				return;
			}
			//TODO where to store the authorized account for a given websocket connection
			//to prevent actions on other actors resources?
			socket.on('message', async (message) => {
				console.log('account-id', account_id);
				this.emit('message', socket, message, account_id);
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
		});
		wss.on('close', () => {
			console.log('[wss] close');
		});
		wss.on('error', (error) => {
			console.log('[wss] error', error);
		});
		wss.on('headers', (headers, req) => {
			// TODO could parse cookies from these headers if we don't connect the `ws.Server` to the `server` above
			console.log('[wss] req.url headers', req.url, headers);
		});
	}

	async close(): Promise<void> {
		const close = promisify(this.wss.close.bind(this.wss));
		await close();
	}
}
