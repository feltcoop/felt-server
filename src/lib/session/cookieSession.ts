import cookie from 'cookie';
import type {ServerResponse} from 'http';

const dev = process.env.NODE_ENV !== 'production';

export const COOKIE_SESSION_KEY = 'session_id';

export interface CookieSessionRequest {
	account_id?: number;
}

export const parseCookie = (
	value: string | undefined | null,
	options?: cookie.CookieParseOptions | undefined,
): Record<string, string> => cookie.parse(value || '', options);

export const setCookie = (res: ServerResponse, value: string): void => {
	res.setHeader('set-cookie', serializeCookie(value));
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

export const toSessionId = (cookies: Record<string, string>): number | undefined =>
	Number(cookies[COOKIE_SESSION_KEY]) || undefined;
