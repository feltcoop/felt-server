import {Logger} from '@feltcoop/felt/util/log.js';

export const initBrowser = (): void => {
	// TODO hacky -- need to change the upstream Logger to be more usable on the client
	Logger.prototype.warn = console.warn.bind(console);
	Logger.prototype.error = console.error.bind(console);
	Logger.error.prefixes.length = 0;
	Logger.error.suffixes.length = 0;
	Logger.warn.prefixes.length = 0;
	Logger.warn.suffixes.length = 0;
	Logger.info.prefixes.length = 0;
	Logger.info.suffixes.length = 0;
	Logger.trace.prefixes.length = 0;
	Logger.trace.suffixes.length = 0;
};
