import {Logger} from '@feltcoop/felt/util/log.js';

import type {ISessionApi} from '$lib/session/SessionApi';

const log = new Logger('[SessionApi]');

/**
 * Transports like websockets cannot set http headers,
 * and therefore they cannot access the (currently cookie-only) session,
 * so they pass this disabled session API to services for error reporting.
 */
export class SessionApiDisabled implements ISessionApi {
	login(): void {
		log.error('login called from a non-http service');
		// TODO BLOCK maybe throw a custom `ClientError` to pass through the error to clients?
		throw Error('login is disabled from non-http services');
	}

	logout(): void {
		log.error('logout called from a non-http service?');
		// TODO BLOCK maybe throw a custom `ClientError` to pass through the error to clients?
		throw Error('logout is disabled from non-http services');
	}
}
