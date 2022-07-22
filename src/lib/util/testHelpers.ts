import sourcemapSupport from 'source-map-support';
import {configureLogLevel, Logger, LogLevel} from '@feltcoop/felt/util/log.js';
import type {OmitStrict} from '@feltcoop/felt';

import {SessionApiMock} from '$lib/session/SessionApiMock';
import type {Database} from '$lib/db/Database';
import {toServiceRequest} from '$lib/server/service';

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

export const toServiceRequestMock = (
	account_id: number,
	db: Database,
	session = new SessionApiMock(), // some tests need to reuse the same mock session
): OmitStrict<ReturnType<typeof toServiceRequest>, 'params'> => {
	const {params: _, ...rest} = toServiceRequest(db, undefined, account_id, session);
	return rest;
};
