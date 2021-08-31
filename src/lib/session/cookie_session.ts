import type {IncomingMessage} from 'http';
import cookie_session from 'cookie-session';
import type {
	CookieSessionRequest as BaseCookieSessionRequest,
	CookieSessionObject as BaseCookieSessionObject,
} from 'cookie-session';

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

const TODO_SERVER_COOKIE_KEYS = ['TODO', 'KEY_2_TODO', 'KEY_3_TODO']; // TODO env

export const to_cookie_session_middleware = () =>
	cookie_session({
		name: 'session_id',
		keys: TODO_SERVER_COOKIE_KEYS,
		maxAge: 1000 * 60 * 60 * 24 * 7 * 6, // 6 weeks
		secure: !dev, // this makes cookies break in prod unless https! see letsencrypt
		sameSite: 'lax',
	});
