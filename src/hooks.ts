import type {GetSession, Handle} from '@sveltejs/kit';

import type {ClientSession} from './session/clientSession.js';
import type {ClientContext} from './server/ApiServer.js';

// TODO how to import this without breaking everything silently?
// import {db} from '$lib/db/db.js';

// TODO this is throwing, it's compiled to cjs by sveltekit or vite I think
// import {Logger} from '@feltcoop/gro';
// const log = new Logger(['[hooks]']);

export const getSession: GetSession<ClientContext, ClientSession> = (request) => {
	console.log('[getSession] authenticated:', request);
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
