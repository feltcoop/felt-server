import {WebSocketServer, type WebSocket, type Data} from 'ws';
import {promisify} from 'util';
import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import {EventEmitter} from 'events';
import type StrictEventEmitter from 'strict-event-emitter-types';
import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import {parseCookie, toSessionId} from '$lib/session/cookieSession';

const log = new Logger(gray('[') + blue('wss') + gray(']'));

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
		wss.on('connection', (socket, req) => {
			log.trace('connection req.url', req.url, wss.clients.size);
			log.trace('connection req.headers', req.headers);

			// TODO BLOCK how was this working before?
			console.log('[WSS TODO] req.account_id', req.account_id);
			const cookies = parseCookie(req.headers.cookie);
			const account_id = toSessionId(cookies);

			if (!account_id) {
				log.trace('request to open connection was unauthenticated');
				socket.send(REQUIRES_AUTHENTICATION_MESSAGE);
				socket.close();
				return;
			}

			socket.on('message', async (data, isBinary) => {
				const message = isBinary ? data : data.toString(); // eslint-disable-line @typescript-eslint/no-base-to-string
				this.emit('message', socket, message, account_id);
			});
			socket.on('open', () => {
				log.trace('open');
			});
			socket.on('close', (code, data) => {
				const reason = data.toString();
				log.trace('close', code, reason);
			});
			socket.on('error', (err) => {
				log.error('error', err);
			});
		});
		wss.on('close', () => {
			log.trace('close');
		});
		wss.on('error', (error) => {
			log.trace('error', error);
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
