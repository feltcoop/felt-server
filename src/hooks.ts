import type {GetSession} from '@sveltejs/kit';
import {noop} from '@feltcoop/felt/util/function.js';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {ClientSession} from '$lib/session/clientSession.js';
import type {CookieSessionRequest} from '$lib/session/cookieSession.js';
import {cookieSessionMiddleware} from '$lib/session/cookieSession';
import {db} from '$lib/db/db';

const log = new Logger('[hooks]');

// TODO BLOCK fix ambient types
type A = App.Session.guest;

export const getSession: GetSession = async (requestEvent) => {
	log.trace('getSession');
	const request = requestEvent.request as CookieSessionRequest;
	cookieSessionMiddleware(request, {} as any, noop); // eslint-disable-line @typescript-eslint/no-floating-promises
	const account_id = request.session?.account_id;
	if (account_id !== undefined) {
		const result = await db.repos.session.loadClientSession(account_id);
		if (result.ok) {
			return result.value;
		}
		log.error('failed to load session', result.message);
		request.session = null!;
	}
	const session: ClientSession = {guest: true}; // TODO BLOCK shouldn't need this declaration, see above
	return session;
};
