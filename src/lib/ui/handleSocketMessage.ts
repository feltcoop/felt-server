import type {DataStore} from '$lib/ui/data';
import type {HandleSocketMessage} from '$lib/ui/socket';

// TODO name? `Websocket`? `ClientWebsocket` to distinguish from the server version?
export const toHandleSocketMessage =
	(data: DataStore): HandleSocketMessage =>
	(rawMessage) => {
		if (typeof rawMessage !== 'string') {
			console.error(
				'[handleSocketMessage] cannot handle websocket message; currently only supports strings',
			);
			return;
		}
		let message: any; // TODO types
		try {
			message = JSON.parse(rawMessage);
		} catch (err) {
			console.error('[handleSocketMessage] bad payload', rawMessage, err);
			return;
		}
		console.log('[handleSocketMessage] message', message);
		// TODO hack
		if (message.type === 'service_response') {
			if (message.messageType === 'create_file') {
				if (message.response.code === 200) {
					data.addFile(message.response.data.file);
				} else {
					console.error('[handleSocketMessage] unhandled response code', message.response.code);
				}
			} else {
				console.error('[handleSocketMessage] unhandled messageType', message.messageType);
			}
		} else {
			console.error('[handleSocketMessage] unhandled message', message);
		}
	};
