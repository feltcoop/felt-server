import polka from 'polka';
import {suite} from 'uvu';
import * as t from 'uvu/assert';
import postgres from 'postgres';
import {createServer} from 'http';

import {ApiServer} from '$lib/server/ApiServer.js';
import {Database} from '$lib/db/Database.js';
import {defaultPostgresOptions} from '$lib/db/postgres.js';
import {WebsocketServer} from '$lib/server/WebsocketServer.js';
import {services} from '$lib/server/services';

const TEST_PORT = 3003; // TODO

/* test__ApiServer */
const test__ApiServer = suite('ApiServer');

test__ApiServer('init and close', async () => {
	const server = createServer();
	const apiServer: ApiServer = new ApiServer({
		server,
		app: polka({server}),
		websocketServer: new WebsocketServer(server),
		db: new Database({sql: postgres(defaultPostgresOptions)}),
		services,
		port: TEST_PORT,
	});
	t.is(apiServer.port, TEST_PORT);
	await apiServer.init();
	// TODO make API requests, and look into before/after
	await apiServer.close();
});

test__ApiServer.run();
/* test__ApiServer */
