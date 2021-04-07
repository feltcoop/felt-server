import polka from 'polka';
import {suite} from 'uvu';
import * as t from 'uvu/assert';
import postgres from 'postgres';

import {ApiServer} from './ApiServer.js';
import {Database} from '../db/Database.js';
import {toDefaultPostgresOptions} from '../db/postgres.js';

const TEST_PORT = 3003; // TODO

/* test_ApiServer */
const test_ApiServer = suite('ApiServer');

test_ApiServer('init and destroy', async () => {
	const server = new ApiServer({
		app: polka(),
		db: new Database({sql: postgres(toDefaultPostgresOptions())}),
		port: TEST_PORT,
	});
	t.is(server.port, TEST_PORT);
	await server.init();
	// TODO make API requests, and look into before/after
	await server.destroy();
});

test_ApiServer.run();
/* /test_ApiServer */
