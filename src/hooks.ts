import type {GetSession, Handle} from '@sveltejs/kit';
import {Logger} from '@feltcoop/felt/util/log.js';

import {db} from '$lib/db/db';
import {setCookie, parseCookie} from '$lib/session/cookieSession';
import {COOKIE_SESSION_KEY} from '$lib/session/SessionApi';

const log = new Logger('[hooks]');

export const handle: Handle = async ({event, resolve}) => {
	console.log(`[handle] event`, event.url.href);
	const cookies = parseCookie(event.request.headers.get('cookie'));
	console.log(`[handle] parsed cookies`, cookies);
	event.locals.account_id = Number(cookies[COOKIE_SESSION_KEY]) || undefined;
	// TODO BLOCK also set the request account_id? and delete `authenticationMiddleware`?
	// event.request.account_id = event.locals.account_id;

	// TODO BLOCK do this here instead of in the middleware (import db directly?)
	// event.locals.user = await getUserInformation(event.request.headers.get('cookie'));

	console.log('[handle] resolving');
	const response = await resolve(event);
	console.log('[handle] resolved');

	return response;
};

export const getSession: GetSession = async (event) => {
	console.log('[getSession]', event.locals);

	const account_id = event.locals.account_id;

	if (!account_id) return {guest: true};

	const result = await db.repos.session.loadClientSession(account_id);
	if (!result.ok) {
		log.error('failed to load session', result.message);
		// TODO BLOCK unset cookies
		// maybe `broken: true` as a workaround if we can't do it here
		// request.session = null!;
		// setCookie(event.request.headers, COOKIE_SESSION_KEY, '');
		return {guest: true};
	}
	return result.value;
};
