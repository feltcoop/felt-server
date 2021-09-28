import type {AsyncStatus} from '@feltcoop/felt';
import {get, writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';

const KEY = Symbol();

export const getSocket = (): SocketStore => getContext(KEY);

export const setSocket = (store: SocketStore): SocketStore => {
	setContext(KEY, store);
	return store;
};

// This store wraps a browser `WebSocket` connection with all of the Sveltey goodness.

// TODO rename? Connection? SocketConnection?
// TODO consider xstate, looks like a good usecase

export interface SocketState {
	url: string | null;
	ws: WebSocket | null;
	connected: boolean;
	status: AsyncStatus; // rename? `connectionStatus`?
	error: string | null;
}

export interface SocketStore {
	subscribe: Readable<SocketState>['subscribe'];
	disconnect: (code?: number) => void;
	connect: (url: string) => void;
	send: (data: object) => boolean; // returns `true` if sent, `false` if not for some reason
}

export interface HandleSocketMessage {
	(rawMessage: any): void;
}

export const toSocketStore = (handleMessage: HandleSocketMessage): SocketStore => {
	const {subscribe, update} = writable<SocketState>(toDefaultSocketState());

	const createWebSocket = (url: string): WebSocket => {
		const ws = new WebSocket(url);
		ws.onopen = (e) => {
			console.log('[socket] open', e);
			//send('hello world, this is client speaking');
			update(($socket) => ({...$socket, status: 'success', connected: true}));
		};
		ws.onclose = (e) => {
			console.log('[socket] close', e);
			update(($socket) => ({...$socket, status: 'initial', connected: false, ws: null, url: null}));
		};
		ws.onmessage = (e) => {
			// console.log('[socket] on message');
			handleMessage(e.data); // TODO should this forward the entire event?
		};
		ws.onerror = (e) => {
			console.log('[socket] error', e);
			update(($socket) => ({...$socket, status: 'failure', error: 'unknown websocket error'}));
		};
		console.log('[socket] ws', ws);

		return ws;
	};

	const store: SocketStore = {
		subscribe,
		disconnect: (code = 1000) => {
			update(($socket) => {
				// TODO this is buggy if `connect` is still pending
				console.log('[socket] disconnect', code, $socket);
				if (!$socket.connected || !$socket.ws || $socket.status !== 'success') {
					console.error('[ws] cannot disconnect because it is not connected'); // TODO return errors instead?
					return $socket;
				}
				$socket.ws.close(code);
				return {...$socket, status: 'pending', connected: false, ws: null, url: null};
			});
		},
		connect: (url) => {
			update(($socket) => {
				console.log('[socket] connect', $socket);
				if ($socket.connected || $socket.ws || $socket.status !== 'initial') {
					console.error('[ws] cannot connect because it is already connected'); // TODO return errors instead?
					return $socket;
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
		},
		send: (data) => {
			const $socket = get(store);
			console.log('[ws] send', data, $socket);
			if (!$socket.ws) {
				console.error('[ws] cannot send without a socket', data, $socket);
				return false;
			}
			if (!$socket.connected) {
				console.error('[ws] cannot send because the websocket is not connected', data, $socket);
				return false;
			}
			$socket.ws.send(JSON.stringify(data));
			return true;
		},
	};

	return store;
};

const toDefaultSocketState = (): SocketState => ({
	url: null,
	ws: null,
	connected: false,
	status: 'initial',
	error: null,
});
