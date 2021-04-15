import send from '@polka/send-type';

import type {ApiServer, Middleware} from '../server/ApiServer.js';

export const toSessionAccountMiddleware = (server: ApiServer): Middleware => {
	return async (req, res, next) => {
		if (!req.session.name) {
			return next();
		}

		console.log('[sessionAccountMiddleware]', req.session.name); // TODO logging
		const findUserResult = await server.db.repos.users.findByName(req.session.name); // TODO users -> accounts
		if (findUserResult.ok) {
			req.user = findUserResult.value;
		} else {
			console.log('resetting session, none found');
			req.session = null!;
			const code =
				findUserResult.type === 'noUserFound'
					? 404
					: findUserResult.type === 'invalidName'
					? 400
					: 500;
			return send(res, code, {reason: findUserResult.reason});
		}

		next();
	};
};
