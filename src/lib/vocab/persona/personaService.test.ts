import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {RandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {createPersonaService} from '$lib/vocab/persona/personaServices';
import {randomEventParams} from '$lib/server/random';
import {CreateAccountPersona} from '$lib/vocab/persona/persona.events';
import {SessionApiMock} from '$lib/server/SessionApiMock';

// TODO this only depends on the database --
// if we don't figure out a robust way to make a global reusable server,
// then change this module to setup and teardown only a `db` instance
// instead of the whole server

/* test__repos */
const test__personaService = suite<TestDbContext & TestAppContext>('personaService');

test__personaService.before(setupDb);
test__personaService.after(teardownDb);

test__personaService('create a persona & test collisions', async ({db}) => {
	//STEP 1: get a server, account, and event context lined up
	const random = new RandomVocabContext(db);
	const account = await random.account();
	const params = await randomEventParams(CreateAccountPersona, random);
	params.name = params.name.toLowerCase();

	let result = await createPersonaService.perform({
		repos: db.repos,
		params,
		account_id: account.account_id,
		session: new SessionApiMock(),
	});

	assert.equal(result.ok, true);

	result = await createPersonaService.perform({
		repos: db.repos,
		params,
		account_id: account.account_id,
		session: new SessionApiMock(),
	});

	assert.equal(result.ok, false);

	params.name = params.name.toUpperCase();
	result = await createPersonaService.perform({
		repos: db.repos,
		params,
		account_id: account.account_id,
		session: new SessionApiMock(),
	});

	assert.equal(result.ok, false);
});

test__personaService.run();
/* test__personaService */
