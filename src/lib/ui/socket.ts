import type {AsyncStatus} from '@feltcoop/felt';
import type {Json} from '@feltcoop/felt/util/json.js';
import {writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';

import type {DataStore} from '$lib/ui/data';

const KEY = Symbol();

export const get_socket = (): SocketStore => getContext(KEY);

export const set_socket = (store: SocketStore): SocketStore => {
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
	status: AsyncStatus; // rename? `connection_status`?
	error: string | null;
	send_count: number;
}

export interface SocketStore {
	subscribe: Readable<SocketState>['subscribe'];
	disconnect: (code?: number) => void;
	connect: (url: string) => void;
	send: (data: Json) => void;
}

export const to_socket_store = (data: DataStore) => {
	const {subscribe, update} = writable<SocketState>(to_default_socket_state(), () => {
		console.log('[socket] listen store');
		return () => {
			console.log('[socket] unlisten store');
			unsubscribe();
		};
	});
	const unsubscribe = subscribe((value) => {
		console.log('[socket] store subscriber', value);
	});

	const create_web_socket = (url: string): WebSocket => {
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
			console.log('[socket] on message!');
			let message: any; // TODO types
			try {
				message = JSON.parse(e.data);
			} catch (err) {
				console.error('bad payload', e, err);
				return;
			}
			console.log('[socket] message', message);
			if (message.file) {
				data.add_file(message.file);
			} else {
				console.warn('TODO unhandled message', message);
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

	const store: SocketStore = {
		subscribe,
		disconnect: (code = 1000) => {
			update(($socket) => {
				// TODO this is buggy if `connect` is still pending
				console.log('[socket] disconnect', code, $socket);
				if (!$socket.connected || !$socket.ws || $socket.status !== 'success') {
					throw Error('Socket cannot disconnect because it is not connected'); // TODO return errors instead?
				}
				$socket.ws.close(code);
				return {...$socket, status: 'pending', connected: false, ws: null, url: null};
			});
		},
		connect: (url) => {
			update(($socket) => {
				console.log('[socket] connect', $socket);
				if ($socket.connected || $socket.ws || $socket.status !== 'initial') {
					throw Error('Socket cannot connect because it is already connected'); // TODO return errors instead?
				}
				return {
					...$socket,
					url,
					connected: false,
					status: 'pending',
					ws: create_web_socket(url),
					error: null,
				};
			});
		},
		send: (data) => {
			update(($socket) => {
				console.log('[ws] send', data, $socket);
				if (!$socket.ws) return $socket;
				$socket.ws.send(JSON.stringify(data));
				return {...$socket, send_count: $socket.send_count + 1};
			});
		},
	};

	return store;
};

const to_default_socket_state = (): SocketState => ({
	url: null,
	ws: null,
	connected: false,
	status: 'initial',
	error: null,
	send_count: 0,
});
