import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';

export const to_authorization_middleware = (_server: ApiServer): Middleware => {
	return async (req, res, next) => {
		if (!req.account_id) {
			// TODO centralize error message strings
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log('[authorization_middleware] account_id', req.account_id); // TODO logging
		next();
	};
};
