import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';

export const toAuthorizationMiddleware = (_server: ApiServer): Middleware => {
	return async (req, res, next) => {
		if (!req.account_id) {
			// TODO centralize error message strings
			return send(res, 401, {reason: 'not logged in'});
		}
		console.log('[authorizationMiddleware] account_id', req.account_id); // TODO logging
		next();
	};
};
