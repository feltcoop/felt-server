import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {createAccountPersonaService} from '$lib/vocab/persona/personaServices';
import {randomEventParams} from '$lib/server/random';
import {CreateAccountPersona} from '$lib/vocab/persona/personaEvents';
import {toServiceRequest} from '$lib/util/testHelpers';

/* test__personaService */
const test__personaService = suite<TestDbContext & TestAppContext>('personaService');

test__personaService.before(setupDb);
test__personaService.after(teardownDb);

test__personaService('create a persona & test collisions', async ({db, random}) => {
	//STEP 1: get a server, account, and event context lined up
	const account = await random.account();
	const params = await randomEventParams(CreateAccountPersona, random);
	const serviceRequest = toServiceRequest(account.account_id, db);

	params.name = params.name.toLowerCase();
	unwrap(await createAccountPersonaService.perform({params, ...serviceRequest}));

	unwrapError(await createAccountPersonaService.perform({params, ...serviceRequest}));

	params.name = params.name.toUpperCase();
	unwrapError(await createAccountPersonaService.perform({params, ...serviceRequest}));
});

test__personaService.run();
/* test__personaService */
