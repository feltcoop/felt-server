import {suite} from 'uvu';
import * as t from 'uvu/assert';

import type {TestServerContext} from '$lib/util/testHelpers.js';
import {setupServer, teardownServer} from '$lib/util/testHelpers.js';
import {ApiServer} from '$lib/server/ApiServer';

// TODO hack because of broken test builds
console.log('ApiServer', ApiServer.name);

/* test__ApiServer */
const test__ApiServer = suite<TestServerContext>('ApiServer');

test__ApiServer.before(setupServer);
test__ApiServer.after(teardownServer);

test__ApiServer('init and close', async ({server}) => {
	t.is(server.port, 3003);
	// TODO do stuff
});

test__ApiServer.run();
/* test__ApiServer */
