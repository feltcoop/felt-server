import polka from 'polka';
import {suite} from 'uvu';
import * as t from 'uvu/assert';
import postgres from 'postgres';
import {createServer} from 'http';

import {ApiServer} from '$lib/server/ApiServer.js';
import {Database} from '$lib/db/Database.js';
import {default_postgres_options} from '$lib/db/postgres.js';
import {WebsocketServer} from '$lib/server/WebsocketServer.js';
import {to_handle_websocket_message} from '$lib/server/handle_websocket_message';
import {service_handlers} from '$lib/server/service_handlers';

const TEST_PORT = 3003; // TODO

/* test_api_server */
const test_api_server = suite('ApiServer');

test_api_server('init and close', async () => {
	const server = createServer();
	const handle_websocket_message = to_handle_websocket_message(service_handlers);
	const api_server: ApiServer = new ApiServer({
		server,
		app: polka({server}),
		websocket_server: new WebsocketServer(server, (websocket_server, socket, message, account_id) =>
			handle_websocket_message(api_server, websocket_server, socket, message, account_id),
		),
		db: new Database({sql: postgres(default_postgres_options)}),
		port: TEST_PORT,
	});
	t.is(api_server.port, TEST_PORT);
	await api_server.init();
	// TODO make API requests, and look into before/after
	await api_server.close();
});

test_api_server.run();
/* /test_api_server */
