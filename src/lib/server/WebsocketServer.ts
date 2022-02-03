import {WebSocketServer, type WebSocket, type Data} from 'ws';
import {promisify} from 'util';
import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import {EventEmitter} from 'events';
import type StrictEventEmitter from 'strict-event-emitter-types';
import {noop} from '@feltcoop/felt/util/function.js';

import type {CookieSessionIncomingMessage} from '$lib/session/cookieSession';
import {toCookieSessionMiddleware} from '$lib/session/cookieSession';

type WebsocketServerEmitter = StrictEventEmitter<EventEmitter, WebsocketServerEvents>;
interface WebsocketServerEvents {
	message: (socket: WebSocket, message: Data, account_id: number) => void;
}

const cookieSessionMiddleware = toCookieSessionMiddleware();

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
		wss.on('connection', async (socket, req: CookieSessionIncomingMessage) => {
			console.log('[wss] connection req.url', req.url, wss.clients.size);
			console.log('[wss] connection req.headers', req.headers);
			await cookieSessionMiddleware(req, {}, noop);
			const account_id = req.session?.account_id;
			if (!account_id) {
				console.log('[wss] request to open connection was unauthenticated');
				//TODO return message to socket (401)
				socket.close();
				return;
			}
			//TODO where to store the authorized account for a given websocket connection
			//to prevent actions on other actors resources?
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
		wss.on('headers', (headers, req) => {
			// TODO could parse cookies from these headers if we don't connect the `WebSocketServer` to the `server` above
			console.log('[wss] req.url headers', req.url, headers);
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
