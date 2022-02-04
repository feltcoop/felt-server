import type {ApiServerRequest} from '$lib/server/ApiServer';

export interface ISessionApi {
	login(account_id: number): void;
	logout(): void;
}

/**
 * `SessionApi` is the API available to services beyond the database repos.
 * Unlike repo methods, they do not compose with database transactions,
 * so they cannot be undone automatically if something else goes wrong
 * while the service processes a request.
 */
export class SessionApi implements ISessionApi {
	constructor(private readonly req: ApiServerRequest | null) {}

	login(account_id: number) {
		if (!this.req) {
			console.error('Expected "req". Was login called from a non-http service?');
			return;
		}
		if (!this.req.session) {
			console.error('Expected "req.session". The authentication middleware may be misconfigured.');
			return;
		}
		this.req.session.account_id = account_id;
	}

	logout() {
		if (!this.req) {
			console.error('Expected "req". Was logout called from a non-http service?');
			return;
		}
		this.req.account_id = undefined!;
		this.req.session = null!;
	}
}
