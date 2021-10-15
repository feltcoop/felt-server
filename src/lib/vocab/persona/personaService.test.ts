import {suite} from 'uvu';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers';
import {create_persona} from '$lib/vocab/persona/persona.events';
import {toRandomVocabContext} from '$lib/vocab/random';
import {randomEventParams} from '$lib/server/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {setupApp, teardownApp} from '$lib/util/testAppHelpers';

// TODO this only depends on the database --
// if we don't figure out a robust way to make a global reusable server,
// then change this module to setup and teardown only a `db` instance
// instead of the whole server

/* test__repos */
const test__personaService = suite<TestServerContext & TestAppContext>('personaService');

test__personaService.before(setupServer);
test__personaService.after(teardownServer);
test__personaService.before(setupApp((() => {}) as any)); // TODO either use `node-fetch` or mock
test__personaService.after(teardownApp);

test__personaService('create a persona & test collisions', async ({server, app}) => {
	//STEP 1: get a server, account, and event context lined up
	const random = toRandomVocabContext(server.db);
	const account = await random.account();
	const params = await randomEventParams(create_persona, random, {account});
	const result = await app.api.dispatch(create_persona.name as any, params);
	console.log('[pstest] result & persona name ', result, params);
	//STEP 2: make a call with name1; expect sucess
	//STEP 3: make a call with name1 again; expect failure
	//Step 4: make a call with NAME1 (uppercase); expect success
});
