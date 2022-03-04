import sourcemapSupport from 'source-map-support';
import {configureLogLevel, Logger, LogLevel} from '@feltcoop/felt/util/log.js';

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
