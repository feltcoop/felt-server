import polka from 'polka';
import {createServer} from 'http';

import {ApiServer} from '$lib/server/ApiServer.js';
import {WebsocketServer} from '$lib/server/WebsocketServer.js';
import {services} from '$lib/server/services';
import {db} from '$lib/db/db';
import {API_SERVER_PORT} from '$lib/config';

const server = createServer();

export const apiServer: ApiServer = new ApiServer({
	server,
	app: polka({server}),
	port: API_SERVER_PORT,
	websocketServer: new WebsocketServer(server),
	db,
	services,
});

apiServer.init().catch((err) => {
	console.error('server.init() failed', err);
	throw err;
});
