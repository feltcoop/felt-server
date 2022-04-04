import type {GetSession, Handle} from '@sveltejs/kit';
import {Logger} from '@feltcoop/felt/util/log.js';

import {db} from '$lib/db/db';
import {setCookie, parseCookie} from '$lib/session/cookieSession';

const log = new Logger('[hooks]');

export const handle: Handle = async ({event, resolve}) => {
	console.log(`handle`, event);
	const cookies = parseCookie(event.request.headers);
	console.log(`parsed cookies`, cookies);
	event.locals.account_id = Number(cookies.account_id) || undefined;
	// TODO BLOCK also set the request account_id? and delete `authenticationMiddleware`?
	// event.request.account_id = event.locals.account_id;

	// TODO BLOCK do this here instead of in the middleware (import db directly?)
	// event.locals.user = await getUserInformation(event.request.headers.get('cookie'));

	const response = await resolve(event);

	return response;
};

export const getSession: GetSession = async (event) => {
	log.trace('getSession', event.locals);

	const account_id = event.locals.account_id;

	if (!account_id) return {guest: true};

	const result = await db.repos.session.loadClientSession(account_id);
	if (!result.ok) {
		log.error('failed to load session', result.message);
		// TODO BLOCK unset cookies
		// request.session = null!;
	}
	return result.value;
};
