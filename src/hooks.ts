import type {GetSession, Handle} from '@sveltejs/kit';
import {noop} from '@feltcoop/felt/util/function.js';
import {Logger} from '@feltcoop/felt/util/log.js';
import cookie from 'cookie';

import type {CookieSessionRequest} from '$lib/session/cookieSession.js';
import {cookieSessionMiddleware} from '$lib/session/cookieSession';
import {db} from '$lib/db/db';

const log = new Logger('[hooks]');

export const handle: Handle = async ({event, resolve}) => {
	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
	cookieSessionMiddleware(request as any, {} as any, noop); // eslint-disable-line @typescript-eslint/no-floating-promises
	event.locals.account_id = cookies.account_id;
	// TODO BLOCK do this here instead of in the middleware (import db directly?)
	// event.locals.user = await getUserInformation(event.request.headers.get('cookie'));

	const response = await resolve(event);

	// TODO block session middleware
	if (!cookies.account_id) {
		// if this is the first time the user has visited this app,
		// set a cookie so that we recognise them when they return
		response.headers.set(
			'set-cookie',
			cookie.serialize('account_id', event.locals.account_id, {
				path: '/',
				httpOnly: true,
			}),
		);
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
