import polka from 'polka';
import postgres from 'postgres';
import {createServer} from 'http';

import {ApiServer} from '$lib/server/ApiServer';
import {Database} from '$lib/db/Database';
import {defaultPostgresOptions} from '$lib/db/postgres';
import {WebsocketServer} from '$lib/server/WebsocketServer';
import {services} from '$lib/server/services';
import {installSourceMaps, log} from '$lib/util/testHelpers';

installSourceMaps();

// TODO we want to create this once and close it after all tests have run --
// maybe refactor to use the Felt obtainable helper --
// but how can we do that without an error-prone timeout?

const TEST_PORT = 3003;

export interface TestServerContext {
	server: ApiServer;
}

export const setupServer = async (context: TestServerContext): Promise<void> => {
	const server = createServer();
	context.server = new ApiServer({
		server,
		app: polka({server}),
		websocketServer: new WebsocketServer(server),
		db: new Database({sql: postgres(defaultPostgresOptions)}),
		port: TEST_PORT,
		services,
	});
	await context.server.init();
};

export const teardownServer = async (context: TestServerContext): Promise<void> => {
	const {server} = context;
	context.server = null!;
	try {
		await server.close();
	} catch (err) {
		log.error('error closing server', err);
	}
};
