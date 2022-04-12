import sourcemapSupport from 'source-map-support';
import {configureLogLevel, Logger, LogLevel} from '@feltcoop/felt/util/log.js';

import {SessionApiMock} from '$lib/session/SessionApiMock';
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const toServiceRequest = (
	account_id: number,
	db: Database,
	session = new SessionApiMock(),
) => ({
	account_id,
	repos: db.repos,
	session,
});
