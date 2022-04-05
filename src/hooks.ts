import type {GetSession, Handle} from '@sveltejs/kit';
import {Logger} from '@feltcoop/felt/util/log.js';

import {db} from '$lib/db/db';
import {parseCookie, toSessionId} from '$lib/session/cookieSession';

const log = new Logger('[hooks]');

export const handle: Handle = async ({event, resolve}) => {
	console.log(`[handle] event`, event.url.href);
	const cookies = parseCookie(event.request.headers.get('cookie'));
	console.log(`[handle] parsed cookies`, cookies);
	event.locals.account_id = toSessionId(cookies);
	// TODO BLOCK also set the request account_id? and delete `authenticationMiddleware`?
	// event.request.account_id = event.locals.account_id;

	// TODO BLOCK do this here instead of in the middleware (import db directly?)
	// event.locals.user = await getUserInformation(event.request.headers.get('cookie'));

	console.log('[handle] resolving');
	const response = await resolve(event);
	// TODO BLOCK can we introspect the session here to update headers to log out if something goes wrong?
	console.log('[handle] resolved');

	return response;
};

export const getSession: GetSession = async (event) => {
	console.log('[getSession]', event.locals);

	const {account_id} = event.locals;

	if (!account_id) return {guest: true};

	const result = await db.repos.session.loadClientSession(account_id);
	if (!result.ok) {
		log.error('failed to load session');
		// TODO BLOCK unset session cookie, see above, don't think it can be done here,
		// so maybe we return `{broken: true}`
		return {guest: true};
	}
	return result.value;
};
