import polka from 'polka';
import {suite} from 'uvu';
import * as t from 'uvu/assert';
import postgres from 'postgres';
import {createServer} from 'http';

import {ApiServer} from '$lib/server/ApiServer.js';
import {Database} from '$lib/db/Database.js';
import {defaultPostgresOptions} from '$lib/db/postgres.js';
import {WebsocketServer} from '$lib/server/WebsocketServer.js';

const TEST_PORT = 3003; // TODO

/* test_ApiServer */
const test_ApiServer = suite('ApiServer');

test_ApiServer('init and close', async () => {
	const server = createServer();
	const apiServer = new ApiServer({
		server,
		app: polka({server}),
		websocketServer: new WebsocketServer(),
		db: new Database({sql: postgres(defaultPostgresOptions)}),
		port: TEST_PORT,
	});
	t.is(apiServer.port, TEST_PORT);
	await apiServer.init();
	// TODO make API requests, and look into before/after
	await apiServer.close();
});

test_ApiServer.run();
/* /test_ApiServer */
