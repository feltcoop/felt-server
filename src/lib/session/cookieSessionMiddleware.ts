import send from '@polka/send-type';
import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {HttpMiddleware} from '$lib/server/ApiServer.js';
import {parseSessionCookie, setSessionCookie} from '$lib/session/sessionCookie';

const log = new Logger(gray('[') + blue('authenticationMiddleware') + gray(']'));

export const cookieSessionMiddleware: HttpMiddleware = async (req, res, next) => {
	if (req.account_id) {
		log.error('unexpectedly already authenticated, server needs to be fixed', req.account_id);
		return send(res, 500, {message: 'invalid server configuration'});
	}
	const parsed = parseSessionCookie(req.headers.cookie);
	if (parsed === undefined) {
		log.trace('unauthenticated request');
		return next();
	} else if (parsed === null) {
		setSessionCookie(res, ''); // reset invalid cookie
		log.trace('unauthenticated request with invalid cookie');
		return next();
	}
	const {account_id, shouldRefreshSignature} = parsed;
	if (shouldRefreshSignature) setSessionCookie(res, account_id); // update signature with first key
	req.account_id = account_id;
	log.trace('authenticated', account_id);
	return next();
};
