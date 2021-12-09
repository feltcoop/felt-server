import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers';
import {toRandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';

/* test__communityRepo */
const test__communityRepo = suite<TestServerContext & TestAppContext>('communityRepo');

test__communityRepo.before(setupServer);
test__communityRepo.after(teardownServer);

test__communityRepo('setHue', async ({server}) => {
	const random = toRandomVocabContext(server.db);
	const community = await random.community();
	assert.type(community.hue, 'number');
	let newHue = community.hue === 1 ? 2 : 1;
	assert.is.not(community.hue, newHue); // just in case we mess the logic up
	const result = await server.db.repos.community.setHue(community.community_id, newHue);
	assert.ok(result.ok);
	const updatedCommunity = await server.db.repos.community.findById(community.community_id);
	assert.ok(updatedCommunity.ok);
	assert.is(updatedCommunity.value.hue, newHue);
});

test__communityRepo.run();
/* test__communityRepo */
