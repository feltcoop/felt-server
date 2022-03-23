import type {GetSession, Handle} from '@sveltejs/kit';
import {Logger} from '@feltcoop/felt/util/log.js';

import {db} from '$lib/db/db';
import {setCookie, parseCookie} from '$lib/session/cookieSession';

const log = new Logger('[hooks]');

export const handle: Handle = async ({event, resolve}) => {
	const cookies = parseCookie(event.request.headers);
	event.locals.account_id = cookies.account_id;
	// TODO BLOCK do this here instead of in the middleware (import db directly?)
	// event.locals.user = await getUserInformation(event.request.headers.get('cookie'));

	const response = await resolve(event);

	// TODO block session middleware
	if (!cookies.account_id) {
		// if this is the first time the user has visited this app,
		// set a cookie so that we recognise them when they return
		setCookie(event.request.headers, 'account_id', event.locals.account_id);
	}

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
