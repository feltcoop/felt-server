import cookie from 'cookie';
import cookieSignature from 'cookie-signature';
import type {ServerResponse} from 'http';

import {fromEnv} from '$lib/server/env';

const dev = process.env.NODE_ENV !== 'production';

const MAX_AGE = 60 * 60 * 24 * 7 * 5; // 5 weeks
const RESET_EXPIRY = new Date('Tue, 06 Apr 2021 15:36:00 GMT');

export const COOKIE_SESSION_NAME = 'session_id';

// TODO make this a param? where should it live?
const keys = fromEnv('COOKIE_KEYS').split('__');

export interface CookieSessionRequest {
	account_id?: number;
}

/**
 * Parses a signed cookie value.
 * @param value Some cookie value.
 * @param options Options passed to the `cookie` parser.
 * @returns If successful, the `account_id`. If invalid, `null`, and if missing, `undefined`.
 */
export const parseSessionCookie = (
	value: string | undefined | null,
	options?: cookie.CookieParseOptions | undefined,
): {account_id: number; shouldRefreshSignature: boolean; keyIndex: number} | undefined | null => {
	if (!value) return undefined;
	const signed = cookie.parse(value, options)[COOKIE_SESSION_NAME];
	if (!signed) return undefined;
	for (let i = 0; i < keys.length; i++) {
		const unsigned = cookieSignature.unsign(signed, keys[i]);
		if (unsigned === false) continue;
		const parsed = Number(unsigned);
		if (!parsed) return null;
		return {account_id: parsed, shouldRefreshSignature: i > 0, keyIndex: i};
	}
	return null;
};

/**
 * Sets the cookie header with the given session cookie value.
 * @param res The Node or browser Response object.
 * @param value The session cookie value. (currently, the `account_id`)
 */
export const setSessionCookie = (
	res: ServerResponse | {headers: Headers},
	value: number | '',
): void => {
	if ('headers' in res) {
		res.headers.set('set-cookie', serializeCookie(value + ''));
	} else {
		res.setHeader('set-cookie', serializeCookie(value + ''));
	}
};

const serializeCookie = (value: string, options: cookie.CookieSerializeOptions = {}): string => {
	const signed = value && cookieSignature.sign(value, keys[0]);
	const {maxAge, expires, ...defaults} = options;
	const finalOptions: cookie.CookieSerializeOptions = {
		path: '/',
		httpOnly: true,
		secure: !dev,
		sameSite: 'lax',
		...defaults,
	};
	if (value) {
		// `Max-Age` takes precedence over `Expires`
		if (maxAge !== undefined) {
			finalOptions.maxAge = maxAge;
		} else if (expires !== undefined) {
			finalOptions.expires = expires;
		} else {
			finalOptions.maxAge = MAX_AGE;
		}
	} else {
		// force empty cookies to expire
		finalOptions.expires = RESET_EXPIRY;
	}
	return cookie.serialize(COOKIE_SESSION_NAME, signed, finalOptions);
};
