import sourcemapSupport from 'source-map-support';
import {configureLogLevel, LogLevel} from '@feltcoop/felt/util/log.js';

configureLogLevel(LogLevel.Info);

let installed = false;

export const installSourceMaps = (): void => {
	if (installed) return;
	installed = true;
	sourcemapSupport.install({
		handleUncaughtExceptions: false,
	});
};
