import {suite} from 'uvu';
import * as t from 'uvu/assert';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers';
import {toRandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {setupApp, teardownApp} from '$lib/util/testAppHelpers';
import {createPersonaService} from '$lib/vocab/persona/personaServices';

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

const personaName = 'jung';

test__personaService('create a persona & test collisions', async ({server}) => {
	//STEP 1: get a server, account, and event context lined up
	const random = toRandomVocabContext(server.db);
	const account = await random.account();
	let params = {name: personaName};

	let result = await createPersonaService.perform({
		server,
		params,
		account_id: account.account_id,
	});

	t.equal(result.ok, true);

	result = await createPersonaService.perform({
		server,
		params,
		account_id: account.account_id,
	});

	t.equal(result.ok, false);

	params = {name: personaName.toUpperCase()};
	result = await createPersonaService.perform({
		server,
		params,
		account_id: account.account_id,
	});

	t.equal(result.ok, false);
});

test__personaService.run();
/* test__personaService */
