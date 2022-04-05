import send from '@polka/send-type';
import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {HttpMiddleware} from '$lib/server/ApiServer.js';
import {parseSessionCookie} from '$lib/session/cookieSession';

const log = new Logger(gray('[') + blue('authenticationMiddleware') + gray(']'));

// TODO maybe rename this to `authenticationMiddleware`

export const cookieSessionMiddleware: HttpMiddleware = async (req, res, next) => {
	if (req.account_id) {
		log.error('unexpectedly already authenticated', req.account_id);
		return send(res, 500, {message: 'invalid server configuration'});
	}

	const account_id = parseSessionCookie(req.headers.cookie);
	if (!account_id) {
		log.trace('unauthenticated request');
		return next();
	}
	req.account_id = account_id;
	log.trace('authenticated', account_id);
	return next();
};
