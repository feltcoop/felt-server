import send from '@polka/send-type';
import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {HttpMiddleware} from '$lib/server/ApiServer.js';
import {parseCookie} from '$lib/session/cookieSession';

const log = new Logger(gray('[') + blue('authenticationMiddleware') + gray(']'));

export const toCookieSessionMiddleware = (): HttpMiddleware => {
	return async (req, res, next) => {
		const cookies = parseCookie(req.headers);
		console.log(`parsed cookies`, cookies);

		if (req.account_id) {
			log.error('unexpectedly already authenticated', req.account_id);
			// TODO centralize error message strings
			return send(res, 500, {message: 'invalid server configuration'});
		}
		if (!req.session.account_id) {
			log.trace('unauthenticated request');
			return next();
		}
		req.account_id = req.session.account_id;
		log.trace('authenticated', req.account_id);
		return next();
	};
};
