import type {GetSession} from '@sveltejs/kit';
import postgres from 'postgres';

import type {ClientSession} from '$lib/session/client_session.js';
import type {CookieSessionRequest} from '$lib/session/cookie_session.js';
import {to_cookie_session_middleware} from '$lib/session/cookie_session';
import {Database} from '$lib/db/Database';
import {default_postgres_options} from '$lib/db/postgres';

// TODO source this from wherever ApiServer.js does
const db = new Database({sql: postgres(default_postgres_options)});

const cookie_session_middleware = to_cookie_session_middleware();

export const getSession: GetSession<CookieSessionRequest, ClientSession> = async (req) => {
	cookie_session_middleware(req, {}, () => {});
	const request: CookieSessionRequest = req as any;
	const account_id = request.session?.account_id;
	if (account_id !== undefined) {
		// TODO this swallows errors
		const result = await db.repos.session.load_client_session(account_id);
		return result.ok ? result.value : {guest: true};
	} else {
		return {guest: true};
	}
};
