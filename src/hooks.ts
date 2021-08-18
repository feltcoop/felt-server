import type {GetSession} from '@sveltejs/kit';
import postgres from 'postgres';
import {validateSession} from '$lib/session/client_session';

import type {SessionRequest, ClientSession} from '$lib/session/client_session.js';
import {Database} from '$lib/db/Database';
import {default_postgres_options} from '$lib/db/postgres';

// TODO source this from wherever Api_Server.js does
const db = new Database({sql: postgres(default_postgres_options)});

export const getSession: GetSession<SessionRequest, ClientSession> = async (req) => {
	let request: SessionRequest = Object.assign(req);
	validateSession(request);
	// TODO is swallowing `context.error`, only return in dev mode? look for "reason"?
	if (request.session?.account_id !== undefined) {
		const result = await db.repos.session.load_client_session(request.session.account_id);
		return result.ok ? result.value : {guest: true};
	} else {
		return {guest: true};
	}
};
