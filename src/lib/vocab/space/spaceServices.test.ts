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
	const space = await random.space(undefined, account, community1);

	const deleteResult = await deleteSpaceService.perform({
		server,
		params: {space_id: space.space_id},
		account_id: account.account_id,
	});
	assert.ok(deleteResult.ok);

	const findSpaceResult = await server.db.repos.space.findById(space.space_id);
	assert.ok(!findSpaceResult.ok);
});

test__spaceServices.run();
/* test__spaceServices */
