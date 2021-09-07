import ws from 'ws';
import {promisify} from 'util';
import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';

import type {CookieSessionIncomingMessage} from '$lib/session/cookie_session';
import {to_cookie_session_middleware} from '$lib/session/cookie_session';

const cookie_session_middleware = to_cookie_session_middleware();

export interface HandleWebsocketServerMessage {
	(websocket_server: WebsocketServer, socket: ws, message: any, account_id: number): Promise<void>;
}

export class WebsocketServer {
	readonly wss: ws.Server;
	readonly server: HttpServer | HttpsServer;
	readonly handle: HandleWebsocketServerMessage;

	constructor(server: HttpServer | HttpsServer, handle: HandleWebsocketServerMessage) {
		this.server = server;
		this.wss = new ws.Server({server});
		this.handle = handle;
	}

	async init(): Promise<void> {
		// TODO I'm not sure about this way of creating the server externally and passing it to both polka and ws
		// const wss = new ws.Server({server: this.server}); // port: 3000
		const {wss} = this;
		console.log('wss.on', wss.on);
		wss.on('connection', (socket, req: CookieSessionIncomingMessage) => {
			console.log('[wss] connection req.url', req.url, wss.clients.size);
			console.log('[wss] connection req.headers', req.headers);
			cookie_session_middleware(req, {}, () => {});
			const account_id = req.session?.account_id;
			if (account_id === undefined) {
				console.log('[wss] request to open connection was unauthenticated');
				socket.close();
				return;
			}
			//TODO where to store the authorized account for a given websocket connection
			//to prevent actions on other actors resources?
			socket.on('message', async (raw_message) => {
				console.log('account-id', account_id);
				await this.handle(this, socket, raw_message, account_id);
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
			console.log('[server] saying hi to connected socket');
			socket.send(
				// the client should understand ActivityStreams vocabulary:
				JSON.stringify({
					id: Math.random().toString().slice(2),
					attributed_to: 'the_server',
					type: 'Create',
					object: {type: 'Chat', content: 'hihi'},
				}),
			);
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
