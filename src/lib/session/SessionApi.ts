import type {ServerResponse} from 'http';
import type {Result} from '@feltcoop/felt';

import type {ApiServerRequest} from '$lib/server/ApiServer';
import {setSessionCookie} from '$lib/session/sessionCookie';
import {Logger} from '@feltcoop/felt/util/log.js';
import type {ErrorResponse} from '$lib/util/error';

const log = new Logger('[SessionApi]');

export interface ISessionApi {
	login: (account_id: number) => Result<object, ErrorResponse>;
	logout: () => Result<object, ErrorResponse>;
}

/**
 * `SessionApi` is the API available to services beyond the database repos.
 * Unlike repo methods, they do not compose with database transactions,
 * so they cannot be undone automatically if something else goes wrong
 * while the service processes a request.
 */
export class SessionApi implements ISessionApi {
	constructor(private readonly req: ApiServerRequest, private readonly res: ServerResponse) {}

	login(account_id: number): Result<object, ErrorResponse> {
		log.trace('logging in', account_id);
		this.req.account_id = account_id;
		setSessionCookie(this.res, account_id);
		return {ok: true};
	}

	logout(): Result<object, ErrorResponse> {
		log.trace('logging out', this.req.account_id);
		this.req.account_id = undefined;
		setSessionCookie(this.res, '');
		return {ok: true};
	}
}
