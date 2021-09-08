import type ws from 'ws';

import type {ApiServer} from '$lib/server/ApiServer';
import type {WebsocketServer} from './WebsocketServer';
import type {Service, ServiceParamsSchema, ServiceResponseData} from '$lib/server/service';

export interface HandleWebsocketMessage {
	(
		server: ApiServer,
		websocket_server: WebsocketServer,
		socket: ws,
		raw_message: ws.Data,
		account_id: number,
	): Promise<void>;
}

export const to_handle_websocket_message =
	(
		service_handlers: Map<string, Service<ServiceParamsSchema, ServiceResponseData>>,
	): HandleWebsocketMessage =>
	async (server, websocket_server, _socket, raw_message, account_id): Promise<void> => {
		if (typeof raw_message !== 'string') {
			console.error(
				'[handle_websocket_message] cannot handle websocket message; currently only supports strings',
			);
			return;
		}

		let message: any; // TODO type
		try {
			message = JSON.parse(raw_message);
		} catch (err) {
			console.error('[handle_websocket_message] failed to parse message', err);
			return;
		}
		console.log('[handle_websocket_message]', message);
		if (!(message as any)?.type) {
			// TODO proper automated validation
			console.error('[handle_websocket_message] invalid message', message);
			return;
		}
		const handler = service_handlers.get(message.type);
		if (!handler) {
			console.error('[handle_websocket_message] unhandled message type', message.type);
			return;
		}

		// TODO types are off, should the `WebsocketServer` know about `ApiServer`
		// or should this handler stuff be extracted?
		const response = await handler.handle(server, message.params, account_id);

		// TODO what should the API for returning/broadcasting responses be?
		const serialized_response = JSON.stringify({
			type: 'handler_response',
			message_type: message.type,
			response,
		});
		for (const client of websocket_server.wss.clients) {
			client.send(serialized_response);
		}
	};
