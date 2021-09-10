import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';

export const to_logout_middleware = (_server: ApiServer): Middleware => {
	return async (req, res) => {
		console.log('[logout_middleware] account', req.account_id); // TODO logging
		req.account_id = undefined!;
		req.session = null!;
		// TODO centralize error message strings
		send(res, 200, {message: 'See ya soon! 👋'}); // TODO API types
	};
};
