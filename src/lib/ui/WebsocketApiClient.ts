// This is the main API client.
// It implements a request/response pattern over websockets instead of fire-and-forget
// using JSON-RPC 2.0

import {toToClientId} from '@feltcoop/felt/util/id.js';

import type {ApiClient} from '$lib/ui/ApiClient';
import type {JsonRpcRequest, JsonRpcResponse} from '$lib/util/jsonRpc';
import {parseJsonRpcResponse} from '$lib/util/jsonRpc';
import type {DataStore} from '$lib/ui/data';

const toId = toToClientId('');

export interface WebsocketApiClient<
	TParamsMap extends Record<string, object>,
	TResultMap extends Record<string, object>,
> extends ApiClient<TParamsMap, TResultMap> {
	handle: (rawMessage: any) => void;
}

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
	send: (request: JsonRpcRequest) => void,
	data: DataStore, // TODO extract
): WebsocketApiClient<TParamsMap, TResultMap> => {
	const pendingRequests: Map<string, any> = new Map(); // TODO

	const client: WebsocketApiClient<TParamsMap, TResultMap> = {
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
			send(request);
			return pendingRequest.promise;
		},
		handle: (rawMessage: any): void => {
			const message = parseSocketMessage(rawMessage);
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
		},
		close: () => {
			//
		},
	};
	return client;
};

// TODO do we need to support another type of message, the non-response kind?
const parseSocketMessage = (rawMessage: any): JsonRpcResponse<any> | null => {
	if (typeof rawMessage !== 'string') {
		console.error(
			'[parseSocketMessage] cannot parse websocket message; currently only supports strings',
		);
		return null;
	}
	let message: any;
	try {
		message = JSON.parse(rawMessage);
	} catch (err) {
		console.error('[parseSocketMessage] message data is not valid JSON', rawMessage, err);
		return null;
	}
	const response = parseJsonRpcResponse(message);
	if (!response) {
		console.error('[parseSocketMessage] message data is not valid JSON-RPC 2.0');
		return null;
	}
	return response;
};
