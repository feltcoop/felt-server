import {Logger} from '@feltcoop/felt/util/log.js';

import type {ISessionApi} from '$lib/session/SessionApi';
import {ClientError} from '$lib/util/error';

const log = new Logger('[SessionApi]');

/**
 * Transports like websockets cannot set http headers,
 * and therefore they cannot access the (currently cookie-only) session,
 * so they pass this disabled session API to services for error reporting.
 */
export class SessionApiDisabled implements ISessionApi {
	login(): void {
		log.error('login was incorrectly called from a non-http service');
		throw new ClientError('login can only be called by http clients');
	}

	logout(): void {
		log.error('logout was incorrectly called from a non-http service');
		throw new ClientError('logout can only be called by http clients');
	}
}
