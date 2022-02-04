import {WebSocketServer, type WebSocket, type Data} from 'ws';
import {promisify} from 'util';
import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import {EventEmitter} from 'events';
import type StrictEventEmitter from 'strict-event-emitter-types';

import type {CookieSessionIncomingMessage} from '$lib/session/cookieSession';
import {cookieSessionMiddleware} from '$lib/session/cookieSession';

// Similar but not identical to `ApiServerRequest`.
export interface WebsocketServerRequest extends CookieSessionIncomingMessage {
	account_id: number;
}

type WebsocketServerEmitter = StrictEventEmitter<EventEmitter, WebsocketServerEvents>;
interface WebsocketServerEvents {
	message: (socket: WebSocket, message: Data, account_id: number) => void;
}

const REQUIRES_AUTHENTICATION_MESSAGE = JSON.stringify({
	message: 'please log in before connecting via websocket',
});

export class WebsocketServer extends (EventEmitter as {new (): WebsocketServerEmitter}) {
	readonly wss: WebSocketServer;
	readonly server: HttpServer | HttpsServer;

	constructor(server: HttpServer | HttpsServer) {
		super();
		this.server = server;
		this.wss = new WebSocketServer({server});
	}

	async init(): Promise<void> {
		const {wss} = this;
		wss.on('connection', (socket, req: WebsocketServerRequest) => {
			console.log('[wss] connection req.url', req.url, wss.clients.size);
			console.log('[wss] connection req.headers', req.headers);

			// Disallow unauthenticated sessions from connecting via websockets.
			// Notice that the `req`'s `WebsocketServerRequest` type has `account_id`
			// but it's not valid until after this authentication check.
			cookieSessionMiddleware(req, {}, () => {});
			const account_id = req.session?.account_id;
			if (account_id == null) {
				console.log('[wss] request to open connection was unauthenticated');
				socket.send(REQUIRES_AUTHENTICATION_MESSAGE);
				socket.close();
				return;
			}
			req.account_id = account_id;

			socket.on('message', async (data, isBinary) => {
				const message = isBinary ? data : data.toString();
				this.emit('message', socket, message, account_id);
			});
			socket.on('open', () => {
				console.log('[wss] open');
			});
			socket.on('close', (code, data) => {
				const reason = data.toString();
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
	}

	async close(): Promise<void> {
		for (const socket of this.wss.clients) {
			socket.terminate();
		}
		const close = promisify(this.wss.close.bind(this.wss));
		await close();
	}
}
