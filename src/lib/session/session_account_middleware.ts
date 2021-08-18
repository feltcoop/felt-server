import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';

export const to_session_account_middleware = (server: ApiServer): Middleware => {
	return async (req, res, next) => {
		if (req.account_session) {
			return send(res, 500, {reason: 'invalid server configuration'});
		}
		if (req.session.account_id === undefined) {
			return next();
		}

		console.log('[session_account_middleware]', req.session.account_id); // TODO logging
		const find_session_result = await server.db.repos.session.load_client_session(
			req.session.account_id,
		);
		if (find_session_result.ok) {
			req.account_session = find_session_result.value;
		}
		next();
	};
};
