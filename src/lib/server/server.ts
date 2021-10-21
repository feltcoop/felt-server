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
	// TODO Is this port check actually correct? Do we need to run on 3001 during the SvelteKit build?
	// TODO maybe use process.env.PORT
	port: process.env.NODE_ENV === 'production' ? 3000 : 3001,
	websocketServer: new WebsocketServer(server),
	db: new Database({sql: postgres(defaultPostgresOptions)}),
	services,
});

apiServer.init().catch((err) => {
	console.error('server.init() failed', err);
	throw err;
});
