import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {RandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {createAccountPersonaService} from '$lib/vocab/persona/personaServices';
import {randomEventParams} from '$lib/server/random';
import {CreateAccountPersona} from '$lib/vocab/persona/personaEvents';
import {SessionApiMock} from '$lib/server/SessionApiMock';

/* test__personaService */
const test__personaService = suite<TestDbContext & TestAppContext>('personaService');

test__personaService.before(setupDb);
test__personaService.after(teardownDb);

test__personaService('create a persona & test collisions', async ({db}) => {
	//STEP 1: get a server, account, and event context lined up
	const random = new RandomVocabContext(db);
	const account = await random.account();
	const params = await randomEventParams(CreateAccountPersona, random);
	params.name = params.name.toLowerCase();

	let result = await createAccountPersonaService.perform({
		repos: db.repos,
		params,
		account_id: account.account_id,
		session: new SessionApiMock(),
	});

	assert.equal(result.ok, true);

	result = await createAccountPersonaService.perform({
		repos: db.repos,
		params,
		account_id: account.account_id,
		session: new SessionApiMock(),
	});

	assert.equal(result.ok, false);

	params.name = params.name.toUpperCase();
	result = await createAccountPersonaService.perform({
		repos: db.repos,
		params,
		account_id: account.account_id,
		session: new SessionApiMock(),
	});

	assert.equal(result.ok, false);
});

test__personaService.run();
/* test__personaService */
