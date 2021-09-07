import type ws from 'ws';

import type {ApiServer} from '$lib/server/ApiServer';
import type {WebsocketServer} from './WebsocketServer';
import type {Service} from '$lib/server/service';

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
	(service_handlers: {[key: string]: Service}): HandleWebsocketMessage =>
	async (server, websocket_server, _socket, raw_message, account_id): Promise<void> => {
		if (typeof raw_message !== 'string') {
			console.error(
				'[handle_websocket_message] cannot handle websocket message; currently only supports strings',
			);
			return;
		}

		let parsed_message: any; // TODO type
		try {
			parsed_message = JSON.parse(raw_message);
		} catch (err) {
			console.error('[handle_websocket_message] failed to parse message', err);
			return;
		}
		console.log('[handle_websocket_message]', parsed_message);
		if (!(parsed_message as any)?.type) {
			// TODO proper validation
			console.error('[handle_websocket_message] invalid message', parsed_message);
			return;
		}
		const handler = service_handlers[parsed_message.type];
		if (!handler) {
			console.warn('[handle_websocket_message] unknown message type', parsed_message.type);
			return;
		}

		// TODO types are off, should the `WebsocketServer` know about `ApiServer`
		// or should this handler stuff be extracted?
		const response = await handler.handle(server, parsed_message.params, account_id);

		// TODO extremely hacky
		for (const client of websocket_server.wss.clients) {
			client.send(
				JSON.stringify({type: 'handler_response', message_type: parsed_message.type, response}),
			);
		}
	};
