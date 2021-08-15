import type {Request, GetSession} from '@sveltejs/kit';
import postgres from 'postgres';
import cookie_session from 'cookie-session';

import type {Client_Session} from '$lib/session/client_session.js';
import {Database} from '$lib/db/Database';
import {default_postgres_options} from '$lib/db/postgres';

export interface SessionRequest extends Request {
	session?: SessionObject;
}

export interface SessionObject {
	account_id: number;
}

// TODO source this from wherever Api_Server.js does
const dev = process.env.NODE_ENV !== 'production';
const TODO_SERVER_COOKIE_KEYS = ['TODO', 'KEY_2_TODO', 'KEY_3_TODO'];
const db = new Database({sql: postgres(default_postgres_options)});

export const getSession: GetSession<SessionRequest, Client_Session> = async (req) => {
	let request: SessionRequest = Object.assign(req);
	cookie_session({
		keys: TODO_SERVER_COOKIE_KEYS,
		maxAge: 1000 * 60 * 60 * 24 * 7 * 6, // 6 weeks
		secure: !dev, // this makes cookies break in prod unless https! see letsencrypt
		sameSite: dev ? 'lax' : false,
		name: 'session_id',
	})(request, {}, function () {
		return;
	});
	// TODO is swallowing `context.error`, only return in dev mode? look for "reason"?
	if (request.session?.account_id !== undefined) {
		const result = await db.repos.session.load_client_session(request.session.account_id);
		return result.ok ? result.value : {guest: true};
	} else {
		return {guest: true};
	}
};
