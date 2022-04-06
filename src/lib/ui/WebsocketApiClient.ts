// This is the main API client.
// It implements a request/response pattern over websockets instead of fire-and-forget
// using JSON-RPC 2.0: https://www.jsonrpc.org/specification

import {toCounter} from '@feltcoop/felt/util/counter.js';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {ApiClient} from '$lib/ui/ApiClient';
import type {ServiceEventInfo} from '$lib/vocab/event/event';
import type {JsonRpcId, JsonRpcRequest, JsonRpcResponse} from '$lib/util/jsonRpc';
import {parseJsonRpcResponse} from '$lib/util/jsonRpc';
import type {BroadcastMessage, StatusMessage} from '$lib/util/websocket';

const log = new Logger('[ws]');

const toId = toCounter();

// TODO doesn't handle the case where the client never hears back from the server,
// might want a timeout on each request

export interface WebsocketApiClient<
	TParamsMap extends Record<string, any>,
	TResultMap extends Record<string, any>,
> extends ApiClient<TParamsMap, TResultMap> {
	handle: (rawMessage: any) => void;
}

interface WebsocketRequest<T = any> {
	request: JsonRpcRequest;
	promise: Promise<T>;
	resolve: (result: T) => void;
}

export const toWebsocketApiClient = <
	TParamsMap extends Record<string, any>,
	TResultMap extends Record<string, any>,
>(
	findService: (name: string) => ServiceEventInfo | undefined,
	send: (request: JsonRpcRequest) => void,
	handleBroadcastMessage: (message: BroadcastMessage) => void,
	handleStatusMessage: (message: StatusMessage) => void,
): WebsocketApiClient<TParamsMap, TResultMap> => {
	// TODO maybe extract a `WebsocketRequests` interface, with `add`/`remove` functions (and `pending` items?)
	const websocketRequests: Map<JsonRpcId, WebsocketRequest> = new Map();
	const toWebsocketRequest = <T>(request: JsonRpcRequest): WebsocketRequest<T> => {
		const websocketRequest: WebsocketRequest<T> = {request} as any;
		websocketRequest.promise = new Promise((resolve) => {
			websocketRequest.resolve = resolve;
		});
		websocketRequests.set(request.id, websocketRequest);
		return websocketRequest;
	};

	const client: WebsocketApiClient<TParamsMap, TResultMap> = {
		find: (name) => findService(name),
		invoke: async (name, params = null!) => {
			log.trace('invoke', name, params);
			const request: JsonRpcRequest<typeof name, TParamsMap> = {
				jsonrpc: '2.0',
				id: toId(),
				method: name,
				params,
			};
			const websocketRequest = toWebsocketRequest<any>(request);
			send(request);
			return websocketRequest.promise;
		},
		handle: (rawMessage) => {
			const message = parseSocketMessage(rawMessage);
			log.trace('handle', message);
			if (!message) return;
			if ('jsonrpc' in message) {
				const found = websocketRequests.get(message.id);
				if (!found) {
					log.error(`Unable to find message with id ${message.id}`);
					return;
				}
				websocketRequests.delete(message.id);
				// TODO upstream the `ok` instead of creating a new object? could return `message.result` directly
				found.resolve({ok: message.result.status === 200, ...message.result});
			} else if (message.type === 'broadcast') {
				handleBroadcastMessage(message);
			} else if (message.type === 'status') {
				handleStatusMessage(message);
			} else {
				log.trace('unhandled message', message);
			}
		},
		close: () => {
			// ?
		},
	};
	return client;
};

// TODO do we need to support another type of message, the non-response kind?
const parseSocketMessage = (
	rawMessage: any,
): JsonRpcResponse<any> | StatusMessage | BroadcastMessage | null => {
	if (typeof rawMessage !== 'string') {
		log.error(
			'[parseSocketMessage] cannot parse websocket message; currently only supports strings',
		);
		return null;
	}
	let message: any;
	try {
		message = JSON.parse(rawMessage);
	} catch (err) {
		log.error('[parseSocketMessage] message data is not valid JSON', rawMessage, err);
		return null;
	}
	if (message.jsonrpc) {
		const response = parseJsonRpcResponse(message);
		if (!response) {
			log.error('[parseSocketMessage] jsonrpc message data is not valid JSON-RPC 2.0', message);
			return null;
		}
		return response;
	} else if (message.type === 'broadcast' || message.type === 'status') {
		return message;
	}
	log.error('[parseSocketMessage] message data is unknown type', message);
	return null;
};
