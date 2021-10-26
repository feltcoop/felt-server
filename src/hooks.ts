import type {GetSession} from '@sveltejs/kit';

import type {ClientSession} from '$lib/session/clientSession.js';
import type {CookieSessionRequest} from '$lib/session/cookieSession.js';
import type {Request} from '$lib/server/ApiServer.js';
import {toCookieSessionMiddleware} from '$lib/session/cookieSession';
import {db} from '$lib/db/db';

const cookieSessionMiddleware = toCookieSessionMiddleware();

const dev = process.env.NODE_ENV !== 'production';

export const getSession: GetSession<CookieSessionRequest, ClientSession> = async (req) => {
	let account_id: number | undefined;
	const request: Request = req as any;
	if (dev) {
		cookieSessionMiddleware(req, {}, () => {});
		account_id = request.session?.account_id;
	} else {
		account_id = request.account_id;
	}
	if (account_id) {
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
