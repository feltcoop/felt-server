import type {GetSession, Handle} from '@sveltejs/kit';
import {Logger} from '@feltcoop/felt/util/log.js';

import {db} from '$lib/db/db';
import {setCookie, parseCookie} from '$lib/session/cookieSession';

const log = new Logger('[hooks]');

export const handle: Handle = async ({event, resolve}) => {
	console.log(`handle`, event);
	const cookies = parseCookie(event.request.headers);
	event.locals.account_id = cookies.account_id;
	// TODO BLOCK also set the request account_id? and delete `authenticationMiddleware`?
	event.request.account_id = event.locals.account_id;

	// TODO BLOCK do this here instead of in the middleware (import db directly?)
	// event.locals.user = await getUserInformation(event.request.headers.get('cookie'));

	const response = await resolve(event);

	return response;
};

export const getSession: GetSession = async (requestEvent) => {
	log.trace('getSession');
	const request = requestEvent.request as CookieSessionRequest & Request; // TODO BLOCK type
	const account_id = request.session?.account_id;
	if (account_id !== undefined) {
		const result = await db.repos.session.loadClientSession(account_id);
		if (result.ok) {
			return result.value;
		}
		log.error('failed to load session', result.message);
		request.session = null!;
	}
	return {guest: true};
};
