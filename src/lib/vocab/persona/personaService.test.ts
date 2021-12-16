import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers';
import {toRandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {createPersonaService} from '$lib/vocab/persona/personaServices';
import {randomEventParams} from '$lib/server/random';
import {create_persona} from '$lib/vocab/persona/persona.events';

// TODO this only depends on the database --
// if we don't figure out a robust way to make a global reusable server,
// then change this module to setup and teardown only a `db` instance
// instead of the whole server

/* test__repos */
const test__personaService = suite<TestServerContext & TestAppContext>('personaService');

test__personaService.before(setupServer);
test__personaService.after(teardownServer);

test__personaService('create a persona & test collisions', async ({server}) => {
	//STEP 1: get a server, account, and event context lined up
	const random = toRandomVocabContext(server.db);
	const account = await random.account();
	const params = await randomEventParams(create_persona, random);
	params.name = params.name.toLowerCase();

	let result = await createPersonaService.perform({
		server,
		params,
		account_id: account.account_id,
	});

	console.log('result', result);
	assert.equal(result.ok, true);

	result = await createPersonaService.perform({
		server,
		params,
		account_id: account.account_id,
	});

	assert.equal(result.ok, false);

	params.name = params.name.toUpperCase();
	result = await createPersonaService.perform({
		server,
		params,
		account_id: account.account_id,
	});

	assert.equal(result.ok, false);
});

test__personaService.run();
/* test__personaService */
