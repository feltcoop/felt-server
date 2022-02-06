import type {IncomingMessage} from 'http';
import cookieSession, {
	type CookieSessionRequest as BaseCookieSessionRequest,
	type CookieSessionObject as BaseCookieSessionObject,
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

export const cookieSessionMiddleware = cookieSession({
	name: 'session_id',
	keys: fromEnv('COOKIE_KEYS').split('__'),
	maxAge: 1000 * 60 * 60 * 24 * 7 * 4, // 4 weeks
	httpOnly: true, // prevents JS from having access in browser
	secure: !dev, // this makes cookies break in prod unless https! see letsencrypt
	sameSite: 'lax', // is the default for modern browsers: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
});
