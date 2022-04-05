import type {GetSession, Handle} from '@sveltejs/kit';
import {Logger} from '@feltcoop/felt/util/log.js';

import {db} from '$lib/db/db';
import {parseCookie, setCookie, toSessionId} from '$lib/session/cookieSession';

const log = new Logger('[hooks]');

export const handle: Handle = async ({event, resolve}) => {
	const cookies = parseCookie(event.request.headers.get('cookie'));
	event.locals.account_id = toSessionId(cookies);
	const response = await resolve(event);
	if (event.locals.brokenSession) {
		setCookie(response, '');
	}
	return response;
};

export const getSession: GetSession = async (event) => {
	const {account_id} = event.locals;
	if (!account_id) return {guest: true};
	const result = await db.repos.session.loadClientSession(account_id);
	if (!result.ok) {
		log.error('failed to load session');
		event.locals.brokenSession = true;
		return {guest: true};
	}
	return result.value;
};
