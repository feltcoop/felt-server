import type {ApiServerRequest} from '$lib/server/ApiServer';
import {setCookie} from '$lib/session/cookieSession';
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
	constructor(private readonly req: ApiServerRequest | null) {}

	login(account_id: number): void {
		console.log('LOGGING IN');
		if (!this.req) {
			log.error('Expected "req". Was login called from a non-http service?');
			return;
		}
		// TODO BLOCK
		// if (!this.req.session) {
		// 	log.error('Expected "req.session". The authentication middleware may be misconfigured.');
		// 	return;
		// }
		setCookie(this.req.headers, 'session_id', {account_id});
		// TODO request.locals?
		console.log(`login, this.req.locals`, this.req.locals);
		this.req.account_id = account_id;
	}

	logout(): void {
		console.log('LOGGING OUT');
		if (!this.req) {
			log.error('Expected "req". Was logout called from a non-http service?');
			return;
		}
		this.req.account_id = undefined!;
		// TODO BLOCK how to do this?
		// TODO BLOCK `session_id` variable ?
		// TODO BLOCK is this `this.res`?
		setCookie(this.req.headers, 'session_id', '');
		// this.req.session = null!;
	}
}
