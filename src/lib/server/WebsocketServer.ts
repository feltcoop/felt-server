import ws from 'ws';
import type {Assignable} from '@feltcoop/felt';
import {promisify} from 'util';

// TODO needs a lot of work!

export class WebsocketServer {
	readonly wss!: ws.Server;

	async init(): Promise<void> {
		// TODO I'm not sure about this way of creating the server externally and passing it to both polka and ws
		// const wss = new ws.Server({server: this.server}); // port: 3000
		const wss = new ws.Server({port: 3002, path: '/ws'}); // TODO
		console.log('wss.on', wss.on);
		(this as Assignable<{wss: ws.Server}, 'wss'>).wss = wss;
		wss.on('connection', (socket, req) => {
			console.log('[wss] connection req.url', req.url, wss.clients.size);
			console.log('[wss] connection req.account', (req as any).account); // TODO broken
			console.log('[wss] connection req.headers', req.headers);
			socket.on('message', (rawMessage) => {
				let message;
				try {
					message = JSON.parse(rawMessage as any);
				} catch (err) {
					console.error('[message] bad message', err, 'do not move and they cannot see you');
				}
				console.log('[wss] [message]', message);
				if (message.type === 'Create') {
					// TODO automate all of this
					const finalMessage = {
						...message,
						attributedTo: '$yourname', // some fields must be set by the server
						id: Math.random().toString().slice(2), // some fields must be set by the server
					};
					const serialized = JSON.stringify(finalMessage);
					for (const client of wss.clients) {
						client.send(serialized);
					}
				} else {
					for (const client of wss.clients) {
						client.send(rawMessage);
					}
				}
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
					attributedTo: 'the_server',
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
