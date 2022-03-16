import type {RequestHandler} from '@sveltejs/kit';
import {noop} from '@feltcoop/felt/util/function.js';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {ClientSession} from '$lib/session/clientSession.js';
import type {CookieSessionRequest} from '$lib/session/cookieSession.js';
import {cookieSessionMiddleware} from '$lib/session/cookieSession';
import {db} from '$lib/db/db';

const log = new Logger('[hooks]');

// TODO The type signature and return values are messy because the SvelteKit `JSONValue` type
// requires an index signature with `any` values.
export const getSession: RequestHandler<any, ClientSession & Record<string, any>> = async (
	requestEvent,
) => {
	log.trace('getSession');
	const request = requestEvent.request as CookieSessionRequest;
	cookieSessionMiddleware(request, {} as any, noop); // eslint-disable-line @typescript-eslint/no-floating-promises
	const account_id = request.session?.account_id;
	if (account_id !== undefined) {
		const result = await db.repos.session.loadClientSession(account_id);
		if (result.ok) {
			const body: ClientSession = result.value;
			return {status: 200, body};
		}
		log.error('failed to load session', result.message);
		request.session = null!;
	}
	const body: ClientSession = {guest: true};
	return {status: 200, body};
};
