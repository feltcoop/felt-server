import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import polka from 'polka';
import postgres from 'postgres';
import {createServer} from 'http';

import {Api_Server} from '$lib/server/Api_Server.js';
import {Database} from '$lib/db/Database.js';
import {default_postgres_options} from '$lib/db/postgres.js';
import {Websocket_Server} from '$lib/server/Websocket_Server.js';

const create_http_server = (): HttpServer | HttpsServer => {
	// TODO support https
	return createServer();
};

const server = create_http_server();

export const api_server = new Api_Server({
	server,
	app: polka({server}),
	websocket_server: new Websocket_Server(), // TODO probably pass `{server}` when fixing socket auth
	db: new Database({sql: postgres(default_postgres_options)}),
	load_render: async () => {
		try {
			// TODO this is a hack to make Rollup not bundle this - needs refactoring
			// TODO what can we do with gro here with helpers or constants?
			const import_path = '../../../svelte-kit/' + 'index.js';
			const mod = (await import(import_path)) as any;
			return mod.render || null;
		} catch (err) {
			return null;
		}
	},
});

api_server.init().catch((err) => {
	console.error('server.init() failed', err);
	throw err;
});
