import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {randomCommunityParams} from '$lib/vocab/random';
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

	const deleteCommunityResult = await deleteCommunityService.perform({
		params: {community_id: persona.community_id},
		...toServiceRequest(account.account_id, db),
	});
	assert.ok(!deleteCommunityResult.ok);
	assert.is(deleteCommunityResult.status, 405);
});

test_communityServices('disallow duplicate community names', async ({db, random}) => {
	const {persona, account} = await random.persona();
	const serviceRequest = toServiceRequest(account.account_id, db);

	const params = randomCommunityParams(persona.persona_id);
	params.name += 'Aa';
	unwrap(await createCommunityService.perform({params, ...serviceRequest}));

	params.name = params.name.toLowerCase();
	let result = await createCommunityService.perform({params, ...serviceRequest});
	assert.ok(!result.ok);
	assert.is(result.status, 409);

	params.name = params.name.toUpperCase();
	result = await createCommunityService.perform({params, ...serviceRequest});
	assert.ok(!result.ok);
	assert.is(result.status, 409);
});

test_communityServices.run();
/* test_communityServices */
