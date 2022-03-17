import type {GetSession} from '@sveltejs/kit';
import {noop} from '@feltcoop/felt/util/function.js';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {CookieSessionRequest} from '$lib/session/cookieSession.js';
import {cookieSessionMiddleware} from '$lib/session/cookieSession';
import {db} from '$lib/db/db';

const log = new Logger('[hooks]');

export const getSession: GetSession = async (requestEvent) => {
	log.trace('getSession');
	const request = requestEvent.request as CookieSessionRequest & Request; // TODO BLOCK type
	// TODO BLOCK move this to `handle`?
	cookieSessionMiddleware(request as any, {} as any, noop); // eslint-disable-line @typescript-eslint/no-floating-promises
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

// TODO might want to do this instead of `cookie-session`

// import cookie from 'cookie';
// import {v4 as uuid} from '@lukeed/uuid';
// import type {Handle} from '@sveltejs/kit';

// export const handle: Handle = async ({event, resolve}) => {
// 	const cookies = cookie.parse(event.request.headers.get('cookie') || '');
// 	event.locals.userid = cookies.userid || uuid();

// 	const response = await resolve(event);

// 	if (!cookies.userid) {
// 		// if this is the first time the user has visited this app,
// 		// set a cookie so that we recognise them when they return
// 		response.headers.set(
// 			'set-cookie',
// 			cookie.serialize('userid', event.locals.userid, {
// 				path: '/',
// 				httpOnly: true,
// 			}),
// 		);
// 	}

// 	return response;
// };
