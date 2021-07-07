// TODO upstream?
// `@types/cookie-session` are both out of sync with the docs
// and add a bunch of unwanted deps, because they import `express` types.
// https://www.npmjs.com/package/cookie-session
declare module 'cookie-session' {
	import type {Middleware} from 'polka';
	import type {Request} from '@sveltejs/kit';

	export interface CookieSessionRequest {
		session: CookieSessionObject;
	}

	export interface CookieSessionObject {
		isNew?: boolean;
		populated?: boolean;
		[propertyName: string]: any;
	}

	export interface CookieSessionConfig {
		// The name of the cookie to set, defaults to `'express:sess'`.
		name?: string;
		// The list of keys to use to sign & verify cookie values.
		// Set cookies are always signed with `keys[0]`,
		// while the other keys are valid for verification, allowing for key rotation.
		keys?: string[];
		// A string which will be used as single key if `keys` is not provided.
		secret?: string;
		// `cookies` options:
		// https://www.npmjs.org/package/cookies#readme
		// A number representing the milliseconds from `Date.now()` for expiry.
		maxAge?: number;
		// A `Date` object indicating the cookie's expiration date
		// (expires at the end of session by default).
		expires?: Date;
		// A string indicating the path of the cookie (`/` by default).
		path?: string;
		// A string indicating the domain of the cookie (no default).
		domain?: string;
		// A boolean indicating whether the cookie is only to be sent over HTTPS
		// (`false` by default for HTTP, `true` by default for HTTPS).
		secure?: boolean;
		// A boolean indicating whether the cookie is only to be sent over HTTP(S),
		// and not made available to client JavaScript (`true` by default).
		httpOnly?: boolean;
		// A boolean or string indicating whether the cookie
		// is a "same site" cookie (`false` by default).
		// This can be set to `'strict'`, `'lax'`, or `true` (which maps to `'strict'`).
		sameSite?: boolean | 'strict' | 'lax';
		// A boolean indicating whether the cookie is to be signed (`false` by default).
		// If this is true, another cookie of the same name with the .sig suffix appended
		// will also be sent, with a 27-byte url-safe base64 SHA1 value representing the hash
		// of *cookie-name=cookie-value* against the first Keygrip key.
		// (https://www.npmjs.com/package/keygrip)
		// This signature key is used to detect tampering the next time a cookie is received.
		signed?: boolean;
		// A boolean indicating whether to overwrite previously
		// set cookies of the same name (`false` by default).
		// If this is true, all cookies set during the same request with the same name
		// (regardless of path or domain)
		// are filtered out of the Set-Cookie header when setting this cookie.
		overwrite?: boolean;
	}

	export default (config: CookieSessionConfig) => Middleware;
}
