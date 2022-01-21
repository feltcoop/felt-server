import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {toRandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';

/* test__communityRepo */
const test__communityRepo = suite<TestDbContext & TestAppContext>('communityRepo');

test__communityRepo.before(setupDb);
test__communityRepo.after(teardownDb);

test__communityRepo('updateSettings', async ({db}) => {
	const random = toRandomVocabContext(db);
	const community = await random.community();
	assert.type(community.settings, 'object');
	assert.type(community.settings.hue, 'number');
	const newHue = community.settings.hue === 1 ? 2 : 1;
	const newSettings = {hue: newHue};
	assert.is.not(community.settings.hue, newHue); // just in case we mess the logic up
	const result = await db.repos.community.updateSettings(community.community_id, newSettings);
	assert.ok(result.ok);
	const updatedCommunity = await db.repos.community.findById(community.community_id);
	assert.ok(updatedCommunity.ok);
	assert.equal(updatedCommunity.value.settings, newSettings);
});

test__communityRepo.run();
/* test__communityRepo */
