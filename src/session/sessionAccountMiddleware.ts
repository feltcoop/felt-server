import send from '@polka/send-type';

import type {ApiServer, Middleware} from '../server/ApiServer.js';

export const toSessionAccountMiddleware = (server: ApiServer): Middleware => {
	return async (req, res, next) => {
		if (!req.session.name) {
			return next();
		}

		console.log('[sessionAccountMiddleware]', req.session.name); // TODO logging
		const findSessionResult = await server.db.repos.session.loadClientSession(req.session.name);
		if (findSessionResult.ok) {
			req.accountSession = findSessionResult.value;
		} else {
			console.log('resetting session, none found');
			req.session = null!;
			return send(res, 404, {reason: 'no session found'});
		}
		next();
	};
};
