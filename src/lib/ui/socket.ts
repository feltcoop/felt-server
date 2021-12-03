import type {AsyncStatus} from '@feltcoop/felt';
import {get, writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';

const KEY = Symbol();

export const HEARTBEAT_INTERVAL = 300000;

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
	(event: MessageEvent<any>): void;
}

export const toSocketStore = (
	handleMessage: HandleSocketMessage,
	sendHeartbeat: () => void,
	heartbeatInterval = HEARTBEAT_INTERVAL,
): SocketStore => {
	const {subscribe, update} = writable<SocketState>(toDefaultSocketState());

	const onWsOpen = () => {
		console.log('[socket] open');
		update(($socket) => ({...$socket, status: 'success', connected: true}));
	};
	const onWsClose = () => {
		console.log('[socket] close');
		update(($socket) => ({
			...$socket,
			status: 'initial',
			connected: false,
			ws: null,
			url: null,
		}));
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
				const ws = createWebSocket(url, handleMessage, sendHeartbeat, heartbeatInterval);
				ws.addEventListener('open', onWsOpen);
				ws.addEventListener('close', onWsClose);
				return {
					...$socket,
					url,
					connected: false,
					status: 'pending',
					ws,
					error: null,
				};
			});
		},
		send: (data) => {
			const $socket = get(store);
			// console.log('[ws] send', data, $socket);
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

const createWebSocket = (
	url: string,
	handleMessage: HandleSocketMessage,
	sendHeartbeat: () => void,
	heartbeatInterval: number,
): WebSocket => {
	const ws = new WebSocket(url);
	const send = ws.send.bind(ws);
	ws.addEventListener('open', () => startHeartbeat());
	ws.addEventListener('close', () => stopHeartbeat());
	ws.addEventListener('message', (e) => {
		lastReceiveTime = Date.now();
		handleMessage(e);
	});
	ws.send = (data) => {
		lastSendTime = Date.now();
		send(data);
	};

	// Send a heartbeat every `heartbeatInterval`,
	// resetting to the most recent time both a send and receive event were handled.
	// This ensures the heartbeat is sent only when actually needed.
	// Note that if the client is receiving events but not sending them, or vice versa,
	// the heartbeat is sent to prevent the remote connection from timing out.
	// (nginx tracks each timer separately and both need to be accounted for --
	// see `proxy_read_timeout` and `proxy_send_timeout` for more)
	let lastSendTime: number;
	let lastReceiveTime: number;
	let heartbeatTimeout: NodeJS.Timeout | null = null;
	const startHeartbeat = () => {
		const now = Date.now();
		lastSendTime = now;
		lastReceiveTime = now;
		queueHeartbeat();
	};
	const stopHeartbeat = () => {
		clearTimeout(heartbeatTimeout!);
		heartbeatTimeout = null;
	};
	const queueHeartbeat = () => {
		heartbeatTimeout = setTimeout(() => {
			// While the timeout was pending, the next timeout time may have changed
			// due to new messages being sent and received,
			// so send the heartbeat only if it's actually expired.
			const now = Date.now();
			if (getNextTimeoutTime() <= now) {
				lastSendTime = now;
				lastReceiveTime = now;
				sendHeartbeat();
			}
			queueHeartbeat();
		}, getNextTimeoutTime() - Date.now());
	};
	const getNextTimeoutTime = () => heartbeatInterval + Math.min(lastSendTime, lastReceiveTime);

	return ws;
};
