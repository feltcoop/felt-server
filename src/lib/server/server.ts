import polka from 'polka';
import postgres from 'postgres';
import {createServer as create_http_server} from 'http';

import {ApiServer} from '$lib/server/ApiServer.js';
import {Database} from '$lib/db/Database.js';
import {default_postgres_options} from '$lib/db/postgres.js';
import {WebsocketServer} from '$lib/server/WebsocketServer.js';

const server = create_http_server();

// TODO this explicit type declaration is needed because of the awkward
// `handle_websocket_message` API, there's some circularity in deps to maybe refactor
export const api_server: ApiServer = new ApiServer({
	server,
	app: polka({server}),
	websocket_server: new WebsocketServer(server),
	db: new Database({sql: postgres(default_postgres_options)}),
	load_instance: async () => {
		try {
			// TODO this is a hack to make Rollup not bundle this - needs refactoring
			// TODO what can we do with gro here with helpers or constants?
			const import_path = '../../../svelte-kit/' + 'index.js';
			const mod = (await import(import_path)) as any;
			return mod.instance || null;
		} catch (err) {
			return null;
		}
	},
});

api_server.init().catch((err) => {
	console.error('server.init() failed', err);
	throw err;
});
