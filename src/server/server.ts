import polka from 'polka';
import postgres from 'postgres';

import {ApiServer} from './ApiServer.js';
import {Database} from '../db/Database.js';
import {defaultPostgresOptions} from '../db/postgres.js';

export const server = new ApiServer({
	app: polka(),
	db: new Database({sql: postgres(defaultPostgresOptions)}),
	loadRender: async () => {
		try {
			// TODO this is a hack to make Rollup not bundle this - needs refactoring
			// TODO what can we do with gro here with helpers or constants?
			const importPath = '../' + 'app.js';
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
