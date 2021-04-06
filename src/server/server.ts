import polka from 'polka';
import {SVELTE_KIT_DIST_PATH} from '@feltcoop/gro/dist/paths.js';
import {numberFromEnv, stringFromEnv} from '@feltcoop/gro/dist/utils/env.js';

import {ApiServer} from './ApiServer.js';
import {Database} from '../db/Database.js';

export const server = new ApiServer({
	app: polka(),
	db: new Database({
		postgresOptions: {
			host: stringFromEnv('PGHOST'),
			port: numberFromEnv('PGPORT', 5432),
			database: stringFromEnv('PGDATABASE', 'felt'),
			username: stringFromEnv('PGUSERNAME', stringFromEnv('PGUSER', 'postgres')),
			password: stringFromEnv('PGPASSWORD', 'password'),
			idle_timeout: numberFromEnv('PGIDLE_TIMEOUT'),
			connect_timeout: numberFromEnv('PGCONNECT_TIMEOUT'),
		},
	}),
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
