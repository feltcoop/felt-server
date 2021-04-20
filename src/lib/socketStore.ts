import type {AsyncStatus} from '@feltcoop/gro';
import type {Json} from '@feltcoop/gro/dist/utils/json.js';
import {writable} from 'svelte/store';
import {messages} from './messagesStore';

// This store wraps a browser `WebSocket` connection with all of the Sveltey goodness.

// TODO rename? Connection? SocketConnection?
// TODO consider xstate, looks like a good usecase

export interface SocketState {
	url: string | null;
	ws: WebSocket | null;
	connected: boolean;
	status: AsyncStatus; // rename? `connectionStatus`? `connection`?
	error: string | null;
	sendCount: number;
}

// TODO is this the preferred type definition?
export type SocketStore = ReturnType<typeof createSocketStore>;

export const createSocketStore = () => {
	const {subscribe, update} = writable<SocketState>(toDefaultSocketState(), () => {
		console.log('[socket] listen store');
		return () => {
			console.log('[socket] unlisten store');
			unsubscribe();
		};
	});
	const unsubscribe = subscribe((value) => {
		console.log('[socket] store subscriber', value);
	});

	const disconnect = (code = 1000): void => {
		update(($socket) => {
			console.log('[socket] disconnect', code, $socket.url);
			if (!$socket.ws) return $socket;
			$socket.ws.close(code);
			return {...$socket, status: 'pending', connected: false, ws: null, url: null};
		});
	};

	const connect = (url: string): void => {
		console.log('[socket] connect', url);
		update(($socket) => {
			if ($socket.connected || $socket.ws || $socket.status !== 'initial') {
				throw Error('socket already connected'); // TODO return errors instead?
			}
			return {
				...$socket,
				url,
				connected: false,
				status: 'pending',
				ws: createWebSocket(url),
				error: null,
			};
		});
	};

	const createWebSocket = (url: string): WebSocket => {
		const ws = new WebSocket(url);
		ws.onopen = (e) => {
			console.log('[socket] open', e);
			send('hello world, this is client speaking');
			update(($socket) => ({...$socket, status: 'success', connected: true}));
		};
		ws.onclose = (e) => {
			console.log('[socket] close', e);
			update(($socket) => ({...$socket, status: 'initial', connected: false, ws: null, url: null}));
		};
		ws.onmessage = (e) => {
			let message: any; // TODO types
			try {
				message = JSON.parse(e.data);
			} catch (err) {
				console.error('bad payload', e, err);
				return;
			}
			console.log('[socket] message', message);
			if (message.type === 'Create') {
				messages.update(($messages) => [message, ...$messages]);
			}
		};
		ws.onerror = (e) => {
			console.log('[socket] error', e);
			update(($socket) => ({...$socket, status: 'failure', error: 'unknown websocket error'}));
			status = 'failure';
		};
		console.log('[socket] ws', ws);

		return ws;
	};

	const send = (data: Json) => {
		update(($socket) => {
			if (!$socket.ws) return $socket;
			$socket.ws.send(JSON.stringify(data));
			return {...$socket, sendCount: $socket.sendCount + 1};
		});
	};

	return {subscribe, disconnect, connect, send};
};

const toDefaultSocketState = (): SocketState => ({
	url: null,
	ws: null,
	connected: false,
	status: 'initial',
	error: null,
	sendCount: 0,
});
