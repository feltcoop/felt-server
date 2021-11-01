import type {GetSession} from '@sveltejs/kit';

import type {ClientSession} from '$lib/session/clientSession.js';
import type {CookieSessionRequest} from '$lib/session/cookieSession.js';
import {toCookieSessionMiddleware} from '$lib/session/cookieSession';
import {db} from '$lib/db/db';

const cookieSessionMiddleware = toCookieSessionMiddleware();

export const getSession: GetSession<CookieSessionRequest, ClientSession> = async (req) => {
	console.log('[hooks] getSession');
	cookieSessionMiddleware(req, {}, () => {});
	const request: CookieSessionRequest = req as any;
	const account_id = request.session?.account_id;
	if (account_id !== undefined) {
		// TODO this swallows errors
		const result = await db.repos.session.loadClientSession(account_id);
		if (result.ok) {
			return result.value;
		} else {
			request.session = null!;
			return {guest: true};
		}
	} else {
		return {guest: true};
	}
};
