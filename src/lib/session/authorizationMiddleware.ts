import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';

export const toAuthorizationMiddleware = (_server: ApiServer): Middleware => {
	return async (req, res, next) => {
		// TODO needs major refactoring, probably hack for now to pass through login
		// TODO we want to support unauthenticated routes so users can publish public content,
		// but for now it's simple and secure to just require an authenticated account for everything
		if (!req.account_id) {
			// TODO centralize error message strings
			return send(res, 401, {message: 'not logged in'});
		}
		console.log('[authorizationMiddleware] account_id', req.account_id); // TODO logging
		next();
	};
};
