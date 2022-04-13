import {Logger} from '@feltcoop/felt/util/log.js';
import type {Result} from '@feltcoop/felt';

import type {ISessionApi} from '$lib/session/SessionApi';
import type {ErrorResponse} from '$lib/util/error';

const log = new Logger('[SessionApiDisabled]');

/**
 * Transports like websockets cannot set http headers,
 * and therefore they cannot access the (currently cookie-only) session,
 * so they pass this disabled session API to services for error reporting.
 */
export class SessionApiDisabled implements ISessionApi {
	login(): Result<object, ErrorResponse> {
		log.error('login was incorrectly called from a non-http service');
		return {ok: false, message: 'login can only be called by http clients'};
	}

	logout(): Result<object, ErrorResponse> {
		log.error('logout was incorrectly called from a non-http service');
		return {ok: false, message: 'logout can only be called by http clients'};
	}
}
