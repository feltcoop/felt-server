import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {randomCommunityParams} from '$lib/util/randomVocab';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {
	deleteCommunityService,
	createCommunityService,
} from '$lib/vocab/community/communityServices';
import {toServiceRequest} from '$lib/util/testHelpers';

/* test_communityServices */
const test_communityServices = suite<TestDbContext & TestAppContext>('communityRepo');

test_communityServices.before(setupDb);
test_communityServices.after(teardownDb);

test_communityServices('unable to delete personal community', async ({db, random}) => {
	const {persona, account} = await random.persona();
	assert.is(
		unwrapError(
			await deleteCommunityService.perform({
				params: {community_id: persona.community_id},
				...toServiceRequest(account.account_id, db),
			}),
		).status,
		405,
	);
});

test_communityServices('disallow duplicate community names', async ({db, random}) => {
	const {persona, account} = await random.persona();
	const serviceRequest = toServiceRequest(account.account_id, db);

	const params = randomCommunityParams(persona.persona_id);
	params.name += 'Aa';
	unwrap(await createCommunityService.perform({params, ...serviceRequest}));

	params.name = params.name.toLowerCase();
	assert.is(
		unwrapError(await createCommunityService.perform({params, ...serviceRequest})).status,
		409,
	);

	params.name = params.name.toUpperCase();
	assert.is(
		unwrapError(await createCommunityService.perform({params, ...serviceRequest})).status,
		409,
	);
});

test_communityServices.run();
/* test_communityServices */
