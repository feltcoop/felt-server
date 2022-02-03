import type ws from 'ws';
import {red} from 'kleur/colors';

import {type JsonRpcResponse, parseJsonRpcRequest} from '$lib/util/jsonRpc';
import type {ApiServer} from '$lib/server/ApiServer';
import {toValidationErrorMessage, validateSchema} from '$lib/util/ajv';
import {SessionApi} from '$lib/server/SessionApi';
import {authorize} from '$lib/server/authorize';

export interface WebsocketMiddleware {
	(socket: ws, rawMessage: ws.Data, account_id: number): Promise<void>;
}

//TODO clean this up
export interface BroadcastMessage {
	type: 'broadcast';
	method: string;
	result: any;
}

export const toWebsocketMiddleware: (server: ApiServer) => WebsocketMiddleware =
	(server) => async (socket, messageData, account_id) => {
		if (typeof messageData !== 'string') {
			console.error(
				'[websocketMiddleware] cannot handle websocket message; currently only supports strings',
			);
			return;
		}

		let rawMessage: any; // TODO type
		try {
			rawMessage = JSON.parse(messageData);
		} catch (err) {
			console.error('[websocketMiddleware] failed to parse message', err);
			return;
		}
		console.log('[websocketMiddleware]', rawMessage);

		// TODO possibly call into `websocketServiceMiddleware` at this point?
		// That way we could separate any other kind of websocket messages
		// and handle services in their own module.
		const message = parseJsonRpcRequest(rawMessage);
		if (!message) {
			console.error('[websocketMiddleware] invalid message', rawMessage);
			return;
		}
		const {method, params} = message;
		const service = server.services.get(method);
		if (!service) {
			console.error('[websocketMiddleware] unhandled request method', method);
			return;
		}
		if (service.event.websockets === false) {
			console.error('[websocketMiddleware] service cannot be called with websockets', method);
			return;
		}

		let result;

		const authorizeResult = authorize(account_id, service);
		if (!authorizeResult.ok) {
			result = {
				ok: false,
				status: 401,
				message: authorizeResult.message,
			};
		} else {
			const validateParams = validateSchema(service.event.params);
			if (!validateParams(params)) {
				console.error('[websocketMiddleware] failed to validate params', validateParams.errors);
				result = {
					ok: false,
					status: 400,
					message: 'invalid params: ' + toValidationErrorMessage(validateParams.errors![0]),
				};
			} else {
				result = await service.perform({
					repos: server.db.repos,
					params,
					account_id,
					session: new SessionApi(null),
				});
			}
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
			console.log('[websocketMiddleware] broadcasting', responseMessage);
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
