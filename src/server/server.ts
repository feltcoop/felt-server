import polka from 'polka';
import {SVELTE_KIT_DIST_PATH} from '@feltcoop/gro/dist/paths.js';

import {ApiServer} from './ApiServer.js';
import {Database} from '../db/Database.js';
import {toDefaultPostgresOptions} from '../db/postgres.js';

export const server = new ApiServer({
	app: polka(),
	db: new Database({postgresOptions: toDefaultPostgresOptions()}),
	loadRender: async () => {
		let importPath = `../${SVELTE_KIT_DIST_PATH}/` + 'app.js'; // don't want Rollup to bundle this
		try {
			const mod = (await import(importPath)) as any;
			return mod.render || null;
		} catch (err) {
			return null;
		}
	},
});

server.init().catch((err) => {
	console.error('server.init() failed', err);
	throw err;
});
