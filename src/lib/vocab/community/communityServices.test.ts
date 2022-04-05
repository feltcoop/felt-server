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
import {SessionApiMock} from '$lib/server/SessionApiMock';

/* test_communityServices */
const test_communityServices = suite<TestDbContext & TestAppContext>('communityRepo');

test_communityServices.before(setupDb);
test_communityServices.after(teardownDb);

test_communityServices('unable to delete personal community', async ({db, random}) => {
	const {persona, account} = await random.persona();

	const deleteCommunityResult = await deleteCommunityService.perform({
		repos: db.repos,
		account_id: account.account_id,
		params: {community_id: persona.community_id},
		session: new SessionApiMock(),
	});
	assert.not(deleteCommunityResult.ok);
	assert.is(deleteCommunityResult.status, 405);
	const errorMessage = deleteCommunityResult.ok ? 'failed' : deleteCommunityResult.message;
	assert.is(errorMessage, 'cannot delete personal community');
});

test_communityServices('disallow duplicate community names', async ({db, random}) => {
	const {persona, account} = await random.persona();
	const serviceRequest = {
		repos: db.repos,
		account_id: account.account_id,
		session: new SessionApiMock(),
	};

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
