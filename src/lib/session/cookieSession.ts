import type {IncomingMessage} from 'http';
import cookie from 'cookie';

import {fromEnv} from '$lib/server/env';

export interface CookieSessionRequest {
	session: CookieSessionObject;
}

export interface CookieSessionIncomingMessage extends IncomingMessage {
	session?: CookieSessionObject;
}

export interface CookieSessionObject {
	account_id?: number;
}

const dev = process.env.NODE_ENV !== 'production';

export const parseCookie = (
	headers: Headers,
	options?: cookie.CookieParseOptions | undefined,
): Record<string, string> => cookie.parse(headers.get('cookie') || '', options);

export const setCookie = (
	headers: Headers,
	name: string,
	value: string,
	options?: cookie.CookieSerializeOptions | undefined,
): void => {
	headers.set('set-cookie', serializeCookie(name, value, options));
};

export const serializeCookie = (
	name: string,
	value: string,
	options?: cookie.CookieSerializeOptions | undefined,
): string =>
	// TODO BLOCK signed cookies -- do we want to use `cookie-session` or `cookies`?
	cookie.serialize(name, value, {
		path: '/',
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 7 * 4, // 4 weeks
		secure: !dev,
		sameSite: 'lax',
		...options,
	});

// TODO BLOCK merge with the above
// export const cookieSessionMiddleware = cookieSession({
// 	name: 'session_id',
// 	keys: fromEnv('COOKIE_KEYS').split('__'),
// 	maxAge: 1000 * 60 * 60 * 24 * 7 * 4, // 4 weeks
// 	httpOnly: true, // prevents JS from having access in browser
// 	secure: !dev, // this makes cookies break in prod unless https! see letsencrypt
// 	sameSite: 'lax', // is the default for modern browsers: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
// });
