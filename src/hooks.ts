import type {GetSession, Handle} from '@sveltejs/kit';

import type {ClientSession} from './session/clientSession.js';
import type {CookieSessionRequest} from 'cookie-session';

import tryGetSession from 'cookie-session';

// TODO how to import this without breaking everything silently?
// import {db} from '$lib/db/db.js';

// TODO this is throwing, it's compiled to cjs by sveltekit or vite I think
// import {Logger} from '@feltcoop/gro';
// const log = new Logger(['[hooks]']);

//TODO source this from wherever ApiServer.js does
const dev = process.env.NODE_ENV !== 'production';
const TODO_SERVER_COOKIE_KEYS = ['TODO', 'KEY_2_TODO', 'KEY_3_TODO'];

export const getSession: GetSession<CookieSessionRequest, ClientSession> = (req) => {
	//console.log('[getSession] authenticated:', parse(request.headers.cookie));
	tryGetSession({
		keys: TODO_SERVER_COOKIE_KEYS,
		maxAge: 1000 * 60 * 60 * 24 * 7 * 6, // 6 weeks
		secure: !dev, // this makes cookies break in prod unless https! see letsencrypt
		sameSite: dev ? 'lax' : false,
		name: 'session_id',
	})(req, {}, function () {});
	console.log('[getSession] authenticated:', req.session.name);
	//console.log('[getSession] authenticated:', !request.context.guest);
	// const {context} = request;
	// return context && 'account' in context
	// 	? {
	// 			// don't expose data that should be on the server only!
	// 			account: {name: context.account.name, account_id: context.account.account_id},
	// 			communities: context.communities,
	// 			friends: context.friends,
	// 			entities: [], // TODO load
	// 	  }
	// 	: {guest: true}; // TODO is swallowing `context.error`, only return in dev mode? look for "reason"?
	return {guest: true}; //Hack until cookies are working again...
};

export const handle: Handle = async ({request, resolve}) => {
	//request.locals.user = await getContext(request.headers.cookieSession);
	console.log('[handle]:', request.headers.cookie);
	const response = await resolve(request);
	return response;
	// return {
	// 	...response,
	// 	headers: {
	// 		...response.headers,
	// 		'x-custom-header': 'giraffe',
	// 	},
	// };
};
