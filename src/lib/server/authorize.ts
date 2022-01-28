import {type Result} from '@feltcoop/felt';

import {type ApiServerRequest} from '$lib/server/ApiServer.js';
import {type Service} from '$lib/server/service';
import {type WebsocketServerRequest} from '$lib/server/WebsocketServer';
import {type ErrorResponse} from '$lib/util/error';

// This currently only checks for the existence of an `account_id` on the request.
// We'll want to allow services to declare more complex rules.
export const authorize = (
	req: ApiServerRequest | WebsocketServerRequest,
	service: Service<any, any>,
): Result<{}, ErrorResponse> => {
	// Authorize all services by default; each service can opt-out as needed.
	const requiresAuthentication = service.event.authenticate ?? true;
	if (!requiresAuthentication) {
		return {ok: true};
	}
	if (!req.account_id) {
		return {ok: false, message: 'not logged in'}; // TODO centralize error message strings
	}
	// TODO add authorization logic based on the account's roles and the requested service
	return {ok: true};
};
