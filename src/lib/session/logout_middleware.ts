import send from '@polka/send-type';

import type {Api_Server, Middleware} from '$lib/server/Api_Server.js';

export const to_logout_middleware = (_server: Api_Server): Middleware => {
	return async (req, res) => {
		console.log('[logout_middleware] account', req.account_session?.account.name); // TODO logging
		if (!req.account_session) {
			return send(res, 401, {reason: `Not logged in! 😕`});
		}
		req.session = null!;
		send(res, 200, {message: 'See ya soon! 👋'}); // TODO API types
	};
};
