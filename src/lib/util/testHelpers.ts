import sourcemapSupport from 'source-map-support';
import {configureLogLevel, Logger, LogLevel} from '@feltcoop/felt/util/log.js';
import * as assert from 'uvu/assert';
import type {Result} from '@feltcoop/felt';

import {SessionApiMock} from '$lib/server/SessionApiMock';
import type {Database} from '$lib/db/Database';

configureLogLevel(LogLevel.Info);

export const log = new Logger('[test]');

let installed = false;

export const installSourceMaps = (): void => {
	if (installed) return;
	installed = true;
	sourcemapSupport.install({
		handleUncaughtExceptions: false,
	});
};

/*
TODO how to extract the error type from the `Result`?
We could remove the remaining `assert.ok(!result.ok)` lines if we can figure out the type:

export const unwrapError = <TError extends object>(
	result: Result<any, TError>,
): {ok: false} & TError => {
	assert.ok(!result.ok);
	return result;
};
*/
export const unwrapError = (result: Result): void => {
	assert.ok(!result.ok);
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const toServiceRequest = (account_id: number, db: Database) => ({
	account_id,
	repos: db.repos,
	session: new SessionApiMock(),
});
