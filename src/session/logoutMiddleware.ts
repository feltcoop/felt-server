import send from '@polka/send-type';

import type {ApiServer, Middleware} from '../server/ApiServer.js';

export const toLogoutMiddleware = (_server: ApiServer): Middleware => {
	return async (req, res) => {
		console.log('[logoutMiddleware] user', req.user?.name); // TODO logging
		if (!req.user) {
			return send(res, 401, {reason: `Not logged in! 😕`});
		}
		req.session = null!;
		send(res, 200, {message: 'See ya soon! 👋'}); // TODO API types
	};
};
