// This is the main API client.
// It implements a request/response pattern over websockets instead of fire-and-forget
// using JSON-RPC 2.0

import {toToClientId} from '@feltcoop/felt/util/id.js';

import type {ApiClient} from '$lib/ui/ApiClient';
import type {SocketStore} from '$lib/ui/socket';
import type {JsonRpcRequest} from '$lib/util/jsonRpc';
import {parseJsonRpcResponse} from '$lib/util/jsonRpc';
import type {DataStore} from '$lib/ui/data';

const toId = toToClientId('');

interface PendingRequest<T = unknown> {
	request: JsonRpcRequest;
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (err: Error) => void;
}

export const toApiClient = <
	TParamsMap extends Record<string, object>,
	TResultMap extends Record<string, object>,
>(
	socket: SocketStore,
	data: DataStore,
): ApiClient<TParamsMap, TResultMap> => {
	// TODO how to do this? should the `ApiClient` be created every time the `ws` in the store changes?
	let ws: WebSocket | null = null;
	socket.subscribe(($socket) => {
		if (ws) {
			// TODO how to handle teardown?
			ws.onmessage = null;
		}
		ws = $socket.ws;
		if (!ws) return;
		ws.onmessage = handle; // TODO ? how to play nicely with the others? should we subscribe to the store?
	});

	const pendingRequests: Map<string, any> = new Map(); // TODO

	// TODO this is very wonky, overwrites the socket `onmessage` handler
	// should this be on the client?
	const handle = (rawMessage: any): void => {
		const message = parseJsonRpcResponse(JSON.parse(rawMessage.data));
		console.log('handle message', message);
		if (!message) return;
		const found = pendingRequests.get(message.id);
		if (!found) {
			console.error(`Unable to find message with id ${message.id}`);
			return;
		}
		pendingRequests.delete(message.id);
		// TODO extract this
		if (found.request.method === 'create_file') {
			if (message.result.code === 200) {
				console.log('message', message);
				data.addFile(message.result.data.file);
			} else {
				console.error('[handleSocketMessage] unhandled response code', message.result.code);
			}
		} else {
			console.error('[handleSocketMessage] unhandled messageMethod', found.request.method);
		}
		found.resolve(message.result);
	};

	const client: ApiClient<TParamsMap, TResultMap> = {
		invoke: async <TMethod extends string, TParams extends TParamsMap[TMethod]>(
			method: TMethod,
			params: TParams,
		) => {
			const request: JsonRpcRequest<typeof method, TParamsMap> = {
				jsonrpc: '2.0',
				id: toId(),
				method,
				params,
			};

			// TODO create a promise that gets saved to a map and then resolved in `handleMessage`

			console.log('request', request);

			// TODO with helper?
			const pendingRequest: PendingRequest<TResultMap[TMethod]> = {request} as any; // TODO
			pendingRequest.promise = new Promise<TResultMap[TMethod]>((resolve, reject) => {
				pendingRequest.resolve = resolve;
				pendingRequest.reject = reject;
			});

			pendingRequests.set(request.id, pendingRequest);
			socket.send(request);
			return pendingRequest.promise;
		},
		close: () => {
			//
		},
	};
	return client;
};
