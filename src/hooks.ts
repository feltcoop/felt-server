import type {GetSession} from '@sveltejs/kit';

import type {ClientSession} from './session/clientSession.js';
import type {CookieSessionRequest} from 'cookie-session';

import postgres from 'postgres';
import tryGetSession from 'cookie-session';
import {Database} from './db/Database';
import {defaultPostgresOptions} from './db/postgres';

// TODO how to import this without breaking everything silently?
// import {db} from '$lib/db/db.js';

// TODO this is throwing, it's compiled to cjs by sveltekit or vite I think
// import {Logger} from '@feltcoop/gro';
// const log = new Logger(['[hooks]']);

//TODO source this from wherever ApiServer.js does
const dev = process.env.NODE_ENV !== 'production';
const TODO_SERVER_COOKIE_KEYS = ['TODO', 'KEY_2_TODO', 'KEY_3_TODO'];
const db = 	new Database({sql: postgres(defaultPostgresOptions)});


export const getSession: GetSession<CookieSessionRequest, ClientSession> = (req) => {
	tryGetSession({
		keys: TODO_SERVER_COOKIE_KEYS,
		maxAge: 1000 * 60 * 60 * 24 * 7 * 6, // 6 weeks
		secure: !dev, // this makes cookies break in prod unless https! see letsencrypt
		sameSite: dev ? 'lax' : false,
		name: 'session_id',
	})(req, {}, function () {});
	console.log('[getSession] authenticated:', req.session.name);
	let session = db.repos.session.loadClientSession(req.session.name);	

	return session.then((result) => {
		return result.ok ? result.value : {guest: true};
	});

	// TODO is swallowing `context.error`, only return in dev mode? look for "reason"?	
};
