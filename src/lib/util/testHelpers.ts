import sourcemapSupport from 'source-map-support';

let installed = false;

export const installSourceMaps = (): void => {
	if (installed) return;
	installed = true;
	sourcemapSupport.install({
		handleUncaughtExceptions: false,
	});
};
