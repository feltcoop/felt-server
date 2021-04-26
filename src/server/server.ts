import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import polka from 'polka';
import postgres from 'postgres';
import {createServer} from 'http';

import {ApiServer} from './ApiServer.js';
import {Database} from '../db/Database.js';
import {defaultPostgresOptions} from '../db/postgres.js';
import {WebsocketServer} from './WebsocketServer.js';

const createHttpServer = (): HttpServer | HttpsServer => {
	// TODO support https
	return createServer();
};

const server = createHttpServer();

export const apiServer = new ApiServer({
	server,
	app: polka({server}),
	websocketServer: new WebsocketServer(), // TODO probably pass `{server}` when fixing socket auth
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

apiServer.init().catch((err) => {
	console.error('server.init() failed', err);
	throw err;
});
