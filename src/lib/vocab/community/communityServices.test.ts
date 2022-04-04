import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {deleteCommunityService} from '$lib/vocab/community/communityServices';
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

test_communityServices.run();
/* test_communityServices */
