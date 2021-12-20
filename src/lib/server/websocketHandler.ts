import type ws from 'ws';
import {red} from '@feltcoop/felt/util/terminal.js';

import {type JsonRpcResponse, parseJsonRpcRequest} from '$lib/util/jsonRpc';
import type {ApiServer} from '$lib/server/ApiServer';
import {toValidationErrorMessage, validateSchema} from '$lib/util/ajv';

export interface WebsocketHandler {
	(server: ApiServer, socket: ws, rawMessage: ws.Data, account_id: number): Promise<void>;
}

//TODO clean this up
export interface BroadcastMessage {
	type: 'broadcast';
	method: string;
	result: any;
}

export const websocketHandler: WebsocketHandler = async (
	server: ApiServer,
	socket: ws,
	messageData: ws.Data,
	account_id: number,
) => {
	if (typeof messageData !== 'string') {
		console.error(
			'[websocketHandler] cannot handle websocket message; currently only supports strings',
		);
		return;
	}

	let rawMessage: any; // TODO type
	try {
		rawMessage = JSON.parse(messageData);
	} catch (err) {
		console.error('[websocketHandler] failed to parse message', err);
		return;
	}
	console.log('[websocketHandler]', rawMessage);
	const message = parseJsonRpcRequest(rawMessage);
	if (!message) {
		console.error('[websocketHandler] invalid message', rawMessage);
		return;
	}
	const {method, params} = message;
	const service = server.services.get(method);
	if (!service) {
		console.error('[websocketHandler] unhandled request method', method);
		return;
	}

	let result;

	const validateParams = validateSchema(service.event.params);
	if (!validateParams(params)) {
		console.error('[websocketHandler] failed to validate params', validateParams.errors);
		result = {
			ok: false,
			status: 400,
			reason: 'invalid params: ' + toValidationErrorMessage(validateParams.errors![0]),
		};
	} else {
		result = await service.perform({server, params, account_id});
	}

	const responseMessage: JsonRpcResponse = {
		jsonrpc: '2.0',
		id: message.id, // TODO this should only be set for the client we're responding to -- maybe don't use `response`?
		result,
	};
	const serializedResponse = JSON.stringify(responseMessage);

	if (!result.ok) {
		socket.send(serializedResponse);
		return; // TODO or do we need to broadcast in some cases?
	}

	if (process.env.NODE_ENV !== 'production') {
		const validateResponse = validateSchema(service.event.response);
		if (!validateResponse(result.value)) {
			console.error(
				red(`failed to validate service response: ${service.event.name}`),
				result,
				validateResponse.errors,
			);
		}
	}

	// TODO this is very hacky -- what should the API for returning/broadcasting responses be?
	// A quick improvement would be to scope to the community.
	// We probably also want 2 types of messages, `JsonRpcResponse` for this specific client
	// and some generic broadcast message type for everyone else.
	socket.send(serializedResponse);

	if (method === 'CreateEntity') {
		console.log('[websocketHandler] broadcasting', responseMessage);
		const broadcastMessage: BroadcastMessage = {
			type: 'broadcast',
			method,
			result,
		};
		const serializedBroadcastMessage = JSON.stringify(broadcastMessage);

		for (const client of server.websocketServer.wss.clients) {
			if (client !== socket) {
				client.send(serializedBroadcastMessage);
			}
		}
	}
};
