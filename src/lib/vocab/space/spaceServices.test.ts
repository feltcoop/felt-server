import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {deleteSpaceService} from '$lib/vocab/space/spaceServices';
import {SessionApiMock} from '$lib/session/SessionApiMock';

/* test__spaceServices */
const test__spaceServices = suite<TestDbContext & TestAppContext>('spaceServices');

test__spaceServices.before(setupDb);
test__spaceServices.after(teardownDb);

test__spaceServices('delete a space in multiple communities', async ({db, random}) => {
	const {space, account} = await random.space();

	const deleteResult = await deleteSpaceService.perform({
		repos: db.repos,
		params: {space_id: space.space_id},
		account_id: account.account_id,
		session: new SessionApiMock(),
	});
	assert.ok(deleteResult.ok);

	const findSpaceResult = await db.repos.space.findById(space.space_id);
	assert.ok(!findSpaceResult.ok);
});

test__spaceServices.run();
/* test__spaceServices */
