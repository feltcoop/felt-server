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

// This store wraps a browser `WebSocket` connection with reconnection and heartbeat behaviors.

// TODO consider extracting a higher order store or component
// to handle reconnection and heartbeat. Connection? SocketConnection?
// A Svelte component could export the `socket` store.

// TODO consider xstate, looks like a good usecase

export interface SocketState {
	url: string | null;
	ws: WebSocket | null;
	open: boolean;
	status: AsyncStatus;
	error: string | null;
}

export interface SocketStore {
	subscribe: Readable<SocketState>['subscribe'];
	disconnect: (code?: number) => void;
	connect: (url: string) => void;
	send: (data: object) => boolean; // returns `true` if sent, `false` if not for some reason
	updateUrl: (url: string) => void;
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
		reconnectCount = 0;
		update(($socket) => ({...$socket, status: 'success', open: true}));
	};
	// This handler gets called when the websocket closes unexpectedly or when it fails to connect.
	// It's not called when the websocket closes due to a `disconnect` call.
	const onWsCloseUnexpectedly = () => {
		console.log('[socket] close');
		if (get(store).open) {
			update(($socket) => ({...$socket, open: false}));
		}
		queueReconnect();
	};

	// TODO extract this?
	let reconnectCount = 0;
	let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
	const RECONNECT_DELAY = 1000; // matches the current Vite/SvelteKit retry rate, but we use a counter to back off
	const RECONNECT_DELAY_MAX = 60000;
	const queueReconnect = () => {
		console.log('queue reconnect?');
		reconnectCount++;
		console.log('reconnecting: reconnectCount', reconnectCount);
		reconnectTimeout = setTimeout(() => {
			// TODO ensure we're still connected!  track the timeout?
			reconnectTimeout = null;
			store.connect(get(store).url!);
		}, Math.min(RECONNECT_DELAY_MAX, RECONNECT_DELAY * reconnectCount));
	};
	const cancelReconnect = () => {
		if (reconnectTimeout !== null) {
			clearTimeout(reconnectTimeout);
			reconnectTimeout = null;
		}
	};

	let lastConnect = Date.now();

	// Returns a bool indicating if it disconnected.
	const tryToDisconnect = (): boolean => {
		if (get(store).ws) {
			store.disconnect();
			return true;
		} else {
			return false;
		}
	};

	const store: SocketStore = {
		subscribe,
		disconnect: (code = 1000) => {
			if (!get(store).ws) return;
			cancelReconnect();
			update(($socket) => {
				console.log('[socket] disconnect', code, $socket);
				const ws = $socket.ws!;
				ws.removeEventListener('open', onWsOpen);
				ws.removeEventListener('close', onWsCloseUnexpectedly);
				ws.close(code); // close *after* removing the 'close' listener
				return {...$socket, status: 'initial', open: false, ws: null};
			});
		},
		connect: (url) => {
			console.log('connect gap', Date.now() - lastConnect);
			lastConnect = Date.now();
			tryToDisconnect();
			update(($socket) => {
				console.log('[socket] connect', $socket);
				const ws = createWebSocket(url, handleMessage, sendHeartbeat, heartbeatInterval);
				ws.addEventListener('open', onWsOpen);
				ws.addEventListener('close', onWsCloseUnexpectedly);
				return {...$socket, url, status: 'pending', ws, error: null};
			});
		},
		updateUrl: (url) => {
			if (get(store).url === url) return;
			if (tryToDisconnect()) {
				store.connect(url);
			} else {
				update(($socket) => ({...$socket, url}));
			}
		},
		send: (data) => {
			const $socket = get(store);
			// console.log('[ws] send', data, $socket);
			if (!$socket.ws) {
				console.error('[ws] cannot send without a socket', data, $socket);
				return false;
			}
			if (!$socket.open) {
				// TODO queue messages instead? return a promise?
				console.error('[ws] cannot send because the websocket is not open', data, $socket);
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
	open: false,
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
	let heartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
	const startHeartbeat = () => {
		const now = Date.now();
		lastSendTime = now;
		lastReceiveTime = now;
		queueHeartbeat();
	};
	const stopHeartbeat = () => {
		if (heartbeatTimeout !== null) {
			clearTimeout(heartbeatTimeout);
			heartbeatTimeout = null;
		}
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
