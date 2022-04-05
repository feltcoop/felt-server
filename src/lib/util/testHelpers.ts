import sourcemapSupport from 'source-map-support';
import {configureLogLevel, Logger, LogLevel} from '@feltcoop/felt/util/log.js';
import * as assert from 'uvu/assert';
import type {Result} from '@feltcoop/felt';

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

export const unwrapError = <TError extends object>(
	result: Result<object, TError>,
): {ok: false} & TError => {
	assert.ok(!result.ok);
	return result;
};
