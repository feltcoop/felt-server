import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';

// TODO this used to lookup the `account` from the database,
// but that'll result in a lot of overfetching.
// Rather than deleting this module, it attaches `account_id` to the `req`,
// and we'll want to take another look at this soon.

export const to_authentication_middleware = (_server: ApiServer): Middleware => {
	return async (req, res, next) => {
		if (req.account_id) {
			// TODO centralize error message strings
			return send(res, 500, {reason: 'invalid server configuration'});
		}
		if (req.session.account_id === undefined) {
			return next();
		}
		req.account_id = req.session.account_id;
		console.log('[authentication_middleware]', req.account_id); // TODO logging
		next();
	};
};
