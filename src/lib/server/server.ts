import polka from 'polka';
import type {Server as HttpServer} from 'http';
import type {Server as HttpsServer} from 'https';
import {createServer as create_http_server} from 'http';
import {createServer as create_https_server} from 'https';
import fs from 'fs';

import {ApiServer} from '$lib/server/ApiServer.js';
import {WebsocketServer} from '$lib/server/WebsocketServer.js';
import {services} from '$lib/server/services';
import {db} from '$lib/db/db';
import {API_SERVER_PORT, VITE_DEPLOY_SERVER_HOST} from '$lib/config';

const create_server = (): HttpServer | HttpsServer => {
	if (process.env.NODE_ENV === 'production') {
		return create_https_server({
			//TODO double check this aligns with GRO standard (load_https_credentials)
			cert: fs.readFileSync(`/etc/letsencrypt/live/${VITE_DEPLOY_SERVER_HOST}/fullchain.pem`),
			key: fs.readFileSync(`/etc/letsencrypt/live/${VITE_DEPLOY_SERVER_HOST}/privkey.pem`),
			//cert: fs.readFileSync('localhost.crt'),
			//key: fs.readFileSync('localhost.key'),
		});
	} else {
		return create_http_server();
	}
};

const server = create_server();

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
