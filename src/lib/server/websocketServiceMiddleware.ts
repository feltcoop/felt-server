import type ws from 'ws';
import {red, blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import {type JsonRpcResponse, parseJsonRpcRequest} from '$lib/util/jsonRpc';
import type {ApiServer} from '$lib/server/ApiServer';
import {toValidationErrorMessage, validateSchema} from '$lib/util/ajv';
import {SessionApiDisabled} from '$lib/session/SessionApiDisabled';
import {authorize} from '$lib/server/authorize';
import type {BroadcastMessage, WebsocketResult} from '$lib/util/websocket';

const log = new Logger(gray('[') + blue('websocketServiceMiddleware') + gray(']'));

const session = new SessionApiDisabled();

export interface WebsocketMiddleware {
	(socket: ws, rawMessage: ws.Data, account_id: number): Promise<void>;
}

export const toWebsocketServiceMiddleware: (server: ApiServer) => WebsocketMiddleware =
	(server) => async (socket, messageData, account_id) => {
		if (typeof messageData !== 'string') {
			log.error('cannot handle websocket message; currently only supports strings');
			return;
		}

		let rawMessage: any;
		try {
			rawMessage = JSON.parse(messageData);
		} catch (err) {
			log.error('failed to parse message', err);
			return;
		}
		log.trace('incoming', rawMessage);

		// TODO possibly move the above code to a generic `websocketMiddleware`?
		// That way we could separate any other kind of websocket messages
		// and handle services in their own module.
		const message = parseJsonRpcRequest(rawMessage);
		if (!message) {
			log.error('invalid message', rawMessage);
			return;
		}
		const {method, params} = message;
		const service = server.services.get(method);
		if (!service) {
			log.error('unhandled request method', method);
			return;
		}
		if (service.event.websockets === false) {
			log.error('service cannot be called with websockets', method);
			return;
		}

		let result: WebsocketResult;

		const authorizeResult = authorize(account_id, service);
		if (!authorizeResult.ok) {
			result = {
				ok: false,
				status: 403,
				message: authorizeResult.message,
			};
		} else {
			//TODO parse/scrub params alongside validation
			const validateParams = validateSchema(service.event.params);
			if (!validateParams(params)) {
				log.error('failed to validate params', validateParams.errors);
				result = {
					ok: false,
					status: 400,
					message: 'invalid params: ' + toValidationErrorMessage(validateParams.errors![0]),
				};
			} else {
				try {
					result = await service.perform({
						repos: server.db.repos,
						params,
						account_id,
						session,
					});
				} catch (err) {
					log.error('service.perform failed', err);
					result = {
						ok: false,
						status: 500,
						message: 'unknown server error',
					};
				}
			}
		}

		const responseMessage: JsonRpcResponse<WebsocketResult> = {
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
				log.error(
					red('failed to validate service response'),
					service.event.name,
					result,
					validateResponse.errors,
				);
				throw Error('Service validation failed');
			}
		}

		// TODO this is very hacky -- what should the API for returning/broadcasting responses be?
		// A quick improvement would be to scope to the community.
		// We probably also want 2 types of messages, `JsonRpcResponse` for this specific client
		// and some generic broadcast message type for everyone else.
		socket.send(serializedResponse);

		if (service.event.broadcast) {
			log.trace('broadcasting', responseMessage);
			const broadcastMessage: BroadcastMessage = {
				type: 'broadcast',
				method,
				result,
				params,
			};
			const serializedBroadcastMessage = JSON.stringify(broadcastMessage);

			for (const client of server.websocketServer.wss.clients) {
				if (client !== socket) {
					client.send(serializedBroadcastMessage);
				}
			}
		}
	};
