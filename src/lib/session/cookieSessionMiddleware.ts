import send from '@polka/send-type';
import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {HttpMiddleware} from '$lib/server/ApiServer.js';
import {parseSessionCookie, setCookie} from '$lib/session/sessionCookie';

const log = new Logger(gray('[') + blue('authenticationMiddleware') + gray(']'));

export const cookieSessionMiddleware: HttpMiddleware = async (req, res, next) => {
	if (req.account_id) {
		log.error('unexpectedly already authenticated, server needs to be fixed', req.account_id);
		return send(res, 500, {message: 'invalid server configuration'});
	}
	const account_id = parseSessionCookie(req.headers.cookie);
	if (account_id === undefined) {
		log.trace('unauthenticated request');
		return next();
	} else if (account_id === null) {
		setCookie(res, ''); // reset invalid cookie
		log.trace('unauthenticated request with invalid cookie');
		return next();
	}
	req.account_id = account_id;
	log.trace('authenticated', account_id);
	return next();
};
