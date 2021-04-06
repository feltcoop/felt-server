import {SVELTE_KIT_DIST_PATH} from '@feltcoop/gro/dist/paths.js';

import {ApiServer} from './ApiServer.js';
import type {ApiServerConfig} from './ApiServer.js';

// TODO refactor
const config: ApiServerConfig = {
	loadRender: async () => {
		let importPath = `../${SVELTE_KIT_DIST_PATH}/` + 'app.js'; // don't want Rollup to bundle this
		try {
			const mod = (await import(importPath)) as any;
			return mod.render || null;
		} catch (err) {
			return null;
		}
	},
};

export const server = new ApiServer(config);

server.init().catch((err) => {
	console.error('server.init() failed', err);
	throw err;
});
