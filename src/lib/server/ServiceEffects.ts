// TODO rename this class?

import type {ApiServerRequest} from './ApiServer';
import type {WebsocketServerRequest} from '$lib/server/WebsocketServer';

// TODO better name for this? is the first place we use this naming convention
export interface IServiceEffects {
	login(account_id: number): void;
	logout(): void;
}

/**
 * `ServiceEffects` is the API available to services beyond the database repos.
 * Unlike repo methods, they do not compose with database transactions,
 * so they cannot be undone automatically if something else goes wrong
 * while the service processes a request.
 */
export class ServiceEffects implements IServiceEffects {
	constructor(private readonly req: ApiServerRequest | WebsocketServerRequest) {}

	login(account_id: number) {
		if (this.req.session) {
			this.req.session.account_id = account_id;
		} else {
			// TODO how to handle this? in what cases can this happen? can it happen if our auth middleware is configured correctly?
		}
	}

	logout() {
		this.req.account_id = undefined!;
		this.req.session = null!;
	}
}
