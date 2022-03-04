import type {GetSession} from '@sveltejs/kit';
import {noop} from '@feltcoop/felt/util/function.js';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {ClientSession} from '$lib/session/clientSession.js';
import type {CookieSessionRequest} from '$lib/session/cookieSession.js';
import {cookieSessionMiddleware} from '$lib/session/cookieSession';
import {db} from '$lib/db/db';

const log = new Logger('[hooks]');

export const getSession: GetSession<CookieSessionRequest, ClientSession> = async (req) => {
	log.trace('getSession');
	cookieSessionMiddleware(req as any, {} as any, noop); // eslint-disable-line @typescript-eslint/no-floating-promises
	const request: CookieSessionRequest = req as any;
	const account_id = request.session?.account_id;
	if (account_id !== undefined) {
		// TODO this swallows errors
		const result = await db.repos.session.loadClientSession(account_id);
		if (result.ok) {
			return result.value;
		}
		request.session = null!;
		return {guest: true};
	}
	return {guest: true};
};
