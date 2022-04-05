import type {Result} from '@feltcoop/felt';

import type {ISessionApi} from '$lib/session/SessionApi';
import type {ErrorResponse} from '$lib/util/error';

export class SessionApiMock implements ISessionApi {
	account_id: number | undefined;

	login(account_id: number): Result<object, ErrorResponse> {
		if (this.account_id) return {ok: false, message: 'already logged in'};
		this.account_id = account_id;
		return {ok: true};
	}
	logout(): Result<object, ErrorResponse> {
		if (!this.account_id) return {ok: false, message: 'not logged in'};
		this.account_id = undefined;
		return {ok: true};
	}
}
