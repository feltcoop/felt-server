import type {ServerResponse} from 'http';

import type {ApiServerRequest} from '$lib/server/ApiServer';
import {COOKIE_SESSION_KEY, serializeCookie} from '$lib/session/cookieSession';
import {Logger} from '@feltcoop/felt/util/log.js';

const log = new Logger('[SessionApi]');

export interface ISessionApi {
	login: (account_id: number) => void;
	logout: () => void;
}

/**
 * `SessionApi` is the API available to services beyond the database repos.
 * Unlike repo methods, they do not compose with database transactions,
 * so they cannot be undone automatically if something else goes wrong
 * while the service processes a request.
 */
export class SessionApi implements ISessionApi {
	constructor(private readonly req: ApiServerRequest, private readonly res: ServerResponse) {}

	login(account_id: number): void {
		log.trace('logging in', account_id);
		// TODO BLOCK should this check `!account_id`?
		this.res.setHeader(COOKIE_SESSION_KEY, serializeCookie(account_id + ''));
		this.req.account_id = account_id;
	}

	logout(): void {
		log.trace('logging out', this.req.account_id);
		this.req.account_id = undefined!;
		this.res.setHeader(COOKIE_SESSION_KEY, '');
		// TODO BLOCK use a helper?
		// setCookie(this.res.headers, COOKIE_SESSION_KEY, '');
	}
}
