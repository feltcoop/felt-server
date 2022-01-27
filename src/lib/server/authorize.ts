import {type Result} from '@feltcoop/felt';

import {type ApiServer, type ApiServerRequest} from '$lib/server/ApiServer.js';
import {type Service} from '$lib/server/service';
import {type WebsocketServerRequest} from '$lib/server/WebsocketServer';
import {type ErrorResponse} from '$lib/util/error';

export const authorize = (
	_server: ApiServer,
	service: Service<any, any>,
	req: ApiServerRequest | WebsocketServerRequest,
): Result<{}, ErrorResponse> => {
	const requiresAuthorization = service.event.authorize ?? true;
	console.log('service.event', requiresAuthorization, service.event);
	if (!requiresAuthorization) {
		return {ok: true};
	}
	if (!req.account_id) {
		// TODO centralize error message strings
		return {ok: false, message: 'not logged in'};
	}
	return {ok: true};
};
