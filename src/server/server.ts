import polka from 'polka';
import postgres from 'postgres';

import {ApiServer} from './ApiServer.js';
import {Database} from '../db/Database.js';
import {toDefaultPostgresOptions} from '../db/postgres.js';
import {seed} from '../db/seed.js';

export const server = new ApiServer({
	app: polka(),
	db: new Database({sql: postgres(toDefaultPostgresOptions())}),
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

server
	.init()
	.then(async () => {
		await seed(server);
	})
	.catch((err) => {
		console.error('server.init() failed', err);
		throw err;
	});
