import cookie from 'cookie';

const dev = process.env.NODE_ENV !== 'production';

export const COOKIE_SESSION_KEY = 'session_id';

export const parseCookie = (
	value: string | undefined | null,
	options?: cookie.CookieParseOptions | undefined,
): Record<string, string> => cookie.parse(value || '', options);

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

// TODO BLOCK where does this belong? maybe `cookieSessionMiddleware`?
export const toSessionId = (cookies: Record<string, string>): number | undefined =>
	Number(cookies[COOKIE_SESSION_KEY]) || undefined;
