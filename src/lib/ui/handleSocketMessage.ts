import type {DataStore} from '$lib/ui/data';
import type {HandleSocketMessage} from '$lib/ui/socket';

// TODO name? `Websocket`? `ClientWebsocket` to distinguish from the server version?
export const toHandleSocketMessage =
	(data: DataStore): HandleSocketMessage =>
	(raw_message) => {
		if (typeof raw_message !== 'string') {
			console.error(
				'[handle_socket_message] cannot handle websocket message; currently only supports strings',
			);
			return;
		}
		let message: any; // TODO types
		try {
			message = JSON.parse(raw_message);
		} catch (err) {
			console.error('[handle_socket_message] bad payload', raw_message, err);
			return;
		}
		console.log('[handle_socket_message] message', message);
		// TODO hack
		if (message.type === 'service_response') {
			if (message.message_type === 'create_file') {
				if (message.response.code === 200) {
					data.add_file(message.response.data.file);
				} else {
					console.error('[handle_socket_message] unhandled response code', message.response.code);
				}
			} else {
				console.error('[handle_socket_message] unhandled message_type', message.message_type);
			}
		} else {
			console.error('[handle_socket_message] unhandled message', message);
		}
	};
