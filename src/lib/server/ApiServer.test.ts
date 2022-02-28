import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import type {TestServerContext} from '$lib/util/testServerHelpers.js';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers.js';
import {ApiServer} from '$lib/server/ApiServer';

/* test__ApiServer */
const test__ApiServer = suite<TestServerContext>('ApiServer');

test__ApiServer.before(setupServer);
test__ApiServer.after(teardownServer);

test__ApiServer('init and close', async ({server}) => {
	assert.is(server.port, 3003);
	// TODO do stuff
	assert.ok(ApiServer);
});

test__ApiServer.run();
/* test__ApiServer */
