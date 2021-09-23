import type ws from 'ws';
import {red} from '@feltcoop/felt/util/terminal.js';

import {JsonRpcResponse, parseJsonRpcRequest} from '$lib/util/jsonRpc';
import type {ApiServer} from '$lib/server/ApiServer';

export interface WebsocketHandler {
	(server: ApiServer, socket: ws, rawMessage: ws.Data, account_id: number): Promise<void>;
}

export const websocketHandler: WebsocketHandler = async (
	server: ApiServer,
	_socket: ws,
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

	if (!service.validateParams()(params)) {
		console.error(red('Failed to validate params'), service.validateParams().errors);
		return;
	}

	// TODO this should perhaps be `result` with a `result.response` alongside other effects/messages
	const response = await service.perform({server, params, account_id});

	if (process.env.NODE_ENV !== 'production') {
		if (!service.validateResponse()(response.value)) {
			console.error(
				red(`failed to validate service response: ${service.name}`),
				response,
				service.validateResponse().errors,
			);
		}
	}

	// TODO this is very hacky -- what should the API for returning/broadcasting responses be?
	// A quick improvement would be to scope to the community.
	// We probably also want 2 types of messages, `JsonRpcResponse` for this specific client
	// and some generic broadcast message type for everyone else.
	const responseMessage: JsonRpcResponse = {
		jsonrpc: '2.0',
		id: message.id, // TODO this should only be set for the client we're responding to -- maybe don't use `response`?
		result: response, // TODO see above where `response` is assigned, should probably be `response.data`
	};
	console.log('[websocketHandler] broadcasting', responseMessage);
	const serializedResponse = JSON.stringify(responseMessage);
	for (const client of server.websocketServer.wss.clients) {
		client.send(serializedResponse);
	}
};
