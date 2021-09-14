import type {GetSession} from '@sveltejs/kit';
import postgres from 'postgres';

import type {ClientSession} from '$lib/session/clientSession.js';
import type {CookieSessionRequest} from '$lib/session/cookieSession.js';
import {toCookieSessionMiddleware} from '$lib/session/cookieSession';
import {Database} from '$lib/db/Database';
import {defaultPostgresOptions} from '$lib/db/postgres';

// TODO source this from wherever ApiServer.js does
const db = new Database({sql: postgres(defaultPostgresOptions)});

const cookieSessionMiddleware = toCookieSessionMiddleware();

export const getSession: GetSession<CookieSessionRequest, ClientSession> = async (req) => {
	cookieSessionMiddleware(req, {}, () => {});
	const request: CookieSessionRequest = req as any;
	const account_id = request.session?.account_id;
	if (account_id !== undefined) {
		// TODO this swallows errors
		const result = await db.repos.session.loadClientSession(account_id);
		if (result.ok) {
			return result.value;
		} else {
			request.session = null!; // TODO this resets the session, but need to also clear user's cookies
			return {guest: true};
		}
	} else {
		return {guest: true};
	}
};
