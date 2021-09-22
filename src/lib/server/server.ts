import polka from 'polka';
import postgres from 'postgres';
import {createServer} from 'http';

import {ApiServer} from '$lib/server/ApiServer.js';
import {Database} from '$lib/db/Database.js';
import {defaultPostgresOptions} from '$lib/db/postgres.js';
import {WebsocketServer} from '$lib/server/WebsocketServer.js';
import {services} from '$lib/server/services';

const server = createServer();

export const apiServer: ApiServer = new ApiServer({
	server,
	app: polka({server}),
	websocketServer: new WebsocketServer(server),
	db: new Database({sql: postgres(defaultPostgresOptions)}),
	services,
	loadInstance: async () => {
		try {
			// TODO this is a hack to make Rollup not bundle this - needs refactoring
			// TODO what can we do with gro here with helpers or config?
			const importPath = '../../../svelte-kit/' + 'index.js';
			const mod = (await import(importPath)) as any;
			return mod.instance || null;
		} catch (err) {
			return null;
		}
	},
});

apiServer.init().catch((err) => {
	console.error('server.init() failed', err);
	throw err;
});
