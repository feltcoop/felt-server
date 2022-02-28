import sourcemapSupport from 'source-map-support';
import {Logger, LogLevel} from '@feltcoop/felt/util/log.js';

Logger.level = LogLevel.Info;

let installed = false;

export const installSourceMaps = (): void => {
	if (installed) return;
	installed = true;
	sourcemapSupport.install({
		handleUncaughtExceptions: false,
	});
};
