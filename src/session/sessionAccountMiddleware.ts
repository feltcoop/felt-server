import send from '@polka/send-type';

import type {ApiServer, Middleware} from '../server/ApiServer.js';

export const toSessionAccountMiddleware = (server: ApiServer): Middleware => {
	return async (req, res, next) => {
		if (!req.session.name) {
			return next();
		}

		console.log('[sessionAccountMiddleware]', req.session.name); // TODO logging
		console.log(req.session.name);
		const findAccountResult = await server.db.repos.accounts.findByName(req.session.name);
		if (findAccountResult.ok) {
			req.account = findAccountResult.value;
		} else {
			console.log('resetting session, none found');
			req.session = null!;
			const code =
				findAccountResult.type === 'noAccountFound'
					? 404
					: findAccountResult.type === 'invalidName'
					? 400
					: 500;
			return send(res, code, {reason: findAccountResult.reason});
		}

		next();
	};
};
