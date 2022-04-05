import type {OutgoingHttpHeaders} from 'http';
import cookie from 'cookie';

const dev = process.env.NODE_ENV !== 'production';

export const parseCookie = (
	value: string | undefined | null,
	options?: cookie.CookieParseOptions | undefined,
): Record<string, string> => cookie.parse(value || '', options);

export const setCookie = (
	headers: OutgoingHttpHeaders,
	name: string,
	value: string,
	options?: cookie.CookieSerializeOptions | undefined,
): void => {
	headers['set-cookie'] = serializeCookie(name, value, options);
};

export const serializeCookie = (
	name: string,
	value: string,
	options?: cookie.CookieSerializeOptions | undefined,
): string =>
	// TODO BLOCK signed cookies -- `keys: fromEnv('COOKIE_KEYS').split('__')`
	cookie.serialize(name, value, {
		path: '/',
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 7 * 4, // 4 weeks
		secure: !dev,
		sameSite: 'lax',
		...options,
	});
