import {fromEnv} from '$lib/server/env';
import cookie from 'cookie';
import type {ServerResponse} from 'http';
// import cookieSignature from 'cookie-signature';

const dev = process.env.NODE_ENV !== 'production';

export const COOKIE_SESSION_KEY = 'session_id';

console.log(`fromEnv('COOKIE_KEYS').split('__')`, fromEnv('COOKIE_KEYS').split('__'));
const secrets = fromEnv('COOKIE_KEYS').split('__');
const [secret] = secrets;
// const keys = new Keygrip(fromEnv('COOKIE_KEYS').split('__'));

export interface CookieSessionRequest {
	account_id?: number;
}

export const parseSessionCookie = (
	value: string | undefined | null,
	options?: cookie.CookieParseOptions | undefined,
): number | undefined => {
	if (!value) return undefined;
	const cookies = parseCookies(value, options);
	return Number(cookies[COOKIE_SESSION_KEY]) || undefined;
};

export const parseCookies = (
	value: string,
	options?: cookie.CookieParseOptions | undefined,
): Record<string, string> => cookie.parse(value || '', options);

export const setCookie = (res: ServerResponse | {headers: Headers}, value: string): void => {
	if ('headers' in res) {
		res.headers.set('Set-Cookie', serializeCookie(value));
	} else {
		res.setHeader('Set-Cookie', serializeCookie(value));
	}
};

export const serializeCookie = (
	value: string,
	options?: cookie.CookieSerializeOptions | undefined,
): string =>
	// TODO BLOCK signed cookies -- `keys: fromEnv('COOKIE_KEYS').split('__')`
	cookie.serialize(COOKIE_SESSION_KEY, value, {
		path: '/',
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 7 * 4, // 4 weeks
		secure: !dev,
		sameSite: 'lax',
		...options,
	});
