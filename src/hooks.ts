import type {GetSession, Handle} from '@sveltejs/kit';
import {Logger} from '@feltcoop/felt/util/log.js';

import {db} from '$lib/db/db';
import {parseSessionCookie, setCookie} from '$lib/session/sessionCookie';

const log = new Logger('[hooks]');

export const handle: Handle = async ({event, resolve}) => {
	const account_id = parseSessionCookie(event.request.headers.get('cookie'));
	if (account_id) {
		event.locals.account_id = account_id;
	}
	const response = await resolve(event);
	if (account_id === null) {
		setCookie(response, ''); // reset invalid cookie
	}
	return response;
};

export const getSession: GetSession = async (event) => {
	const {account_id} = event.locals;
	if (!account_id) return {guest: true};
	const result = await db.repos.session.loadClientSession(account_id);
	if (!result.ok) {
		// TODO what's the best UX for this condition? just ask the user to try again?
		// If needed, could set `event.locals` to have `handle` manage this condition:
		// event.locals.failedToLoadSession = true;
		log.error('failed to load session');
		return {guest: true};
	}
	return result.value;
};
