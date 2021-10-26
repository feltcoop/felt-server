import type {IncomingMessage} from 'http';
import cookieSession from 'cookie-session';
import type {
	CookieSessionRequest as BaseCookieSessionRequest,
	CookieSessionObject as BaseCookieSessionObject,
} from 'cookie-session';

import {fromEnv} from '$lib/server/env';

export interface CookieSessionRequest extends BaseCookieSessionRequest {
	session: CookieSessionObject;
}

export interface CookieSessionIncomingMessage extends IncomingMessage {
	session?: CookieSessionObject;
}

export interface CookieSessionObject extends BaseCookieSessionObject {
	account_id?: number;
}

const dev = process.env.NODE_ENV !== 'production';

export const toCookieSessionMiddleware = () =>
	cookieSession({
		name: 'session_id',
		keys: fromEnv('COOKIE_KEYS').split('__'),
		maxAge: 1000 * 60 * 60 * 24 * 7 * 4, // 4 weeks
		httpOnly: true, // prevents JS from having access in browser
		secure: !dev, // this makes cookies break in prod unless https! see letsencrypt
		sameSite: 'lax',
	});
