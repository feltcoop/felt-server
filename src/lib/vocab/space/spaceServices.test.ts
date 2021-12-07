import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers';
import {toRandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {deleteSpaceService} from '$lib/vocab/space/spaceServices';

/* test__spaceServices */
const test__spaceServices = suite<TestServerContext & TestAppContext>('spaceServices');

test__spaceServices.before(setupServer);
test__spaceServices.after(teardownServer);

test__spaceServices('delete a space in multiple communities', async ({server}) => {
	const random = toRandomVocabContext(server.db);
	const account = await random.account();
	const community1 = await random.community();
	const community2 = await random.community();
	const community3 = await random.community();
	const space = await random.space(undefined, account, community1);

	// add the space to other communities
	// TODO need a repo method for this
	await server.db.sql<any>`
    INSERT INTO community_spaces (space_id, community_id) VALUES (
      ${space.space_id},${community2.community_id}
	)`;
	await server.db.sql<any>`
    INSERT INTO community_spaces (space_id, community_id) VALUES (
      ${space.space_id},${community3.community_id}
	)`;
	let findCommunitySpacesResult = await server.db.sql<any>`
		SELECT space_id FROM community_spaces WHERE space_id=${space.space_id}
	`;
	assert.is(findCommunitySpacesResult.count, 3);

	const deleteResult = await deleteSpaceService.perform({
		server,
		params: {space_id: space.space_id},
		account_id: account.account_id,
	});
	assert.ok(deleteResult.ok);

	const findSpaceResult = await server.db.repos.space.findById(space.space_id);
	assert.ok(!findSpaceResult.ok);

	findCommunitySpacesResult = await server.db.sql<any>`
		SELECT space_id FROM community_spaces WHERE space_id=${space.space_id}
	`;
	assert.is(findCommunitySpacesResult.count, 0);
});

test__spaceServices.run();
/* test__spaceServices */
