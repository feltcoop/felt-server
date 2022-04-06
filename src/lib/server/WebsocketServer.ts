import {WebSocketServer, type WebSocket, type Data} from 'ws';
import {promisify} from 'util';
import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import {EventEmitter} from 'events';
import type StrictEventEmitter from 'strict-event-emitter-types';
import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import {parseSessionCookie} from '$lib/session/sessionCookie';
import type {StatusMessage} from '$lib/util/websocket';

const log = new Logger(gray('[') + blue('wss') + gray(']'));

type WebsocketServerEmitter = StrictEventEmitter<EventEmitter, WebsocketServerEvents>;
interface WebsocketServerEvents {
	message: (socket: WebSocket, message: Data, account_id: number) => void;
}

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

			const parsed = parseSessionCookie(req.headers.cookie);
			if (!parsed) {
				log.trace('request to open connection was unauthenticated');
				socket.send(REQUIRES_AUTHENTICATION_MESSAGE_STR);
				socket.close();
				return;
			}
			const {account_id} = parsed;

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

const REQUIRES_AUTHENTICATION_MESSAGE: StatusMessage = {
	type: 'status',
	status: 401,
	message: 'please log in before connecting via websocket',
};
const REQUIRES_AUTHENTICATION_MESSAGE_STR = JSON.stringify(REQUIRES_AUTHENTICATION_MESSAGE);
