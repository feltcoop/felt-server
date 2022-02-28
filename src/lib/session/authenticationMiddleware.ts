import send from '@polka/send-type';
import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {ApiServer, HttpMiddleware} from '$lib/server/ApiServer.js';

const log = new Logger(gray('[') + blue('authenticationMiddleware') + gray(']'));

export const toAuthenticationMiddleware = (_server: ApiServer): HttpMiddleware => {
	return async (req, res, next) => {
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
