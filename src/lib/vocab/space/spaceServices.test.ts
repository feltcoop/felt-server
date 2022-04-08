import {suite} from 'uvu';
import {unwrap, unwrapError} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {deleteSpaceService} from '$lib/vocab/space/spaceServices';
import {SessionApiMock} from '$lib/server/SessionApiMock';

/* test__spaceServices */
const test__spaceServices = suite<TestDbContext & TestAppContext>('spaceServices');

test__spaceServices.before(setupDb);
test__spaceServices.after(teardownDb);

test__spaceServices('delete a space in multiple communities', async ({db, random}) => {
	const {space, account} = await random.space();

	unwrap(
		await deleteSpaceService.perform({
			repos: db.repos,
			params: {space_id: space.space_id},
			account_id: account.account_id,
			session: new SessionApiMock(),
		}),
	);

	unwrapError(await db.repos.space.findById(space.space_id));
});

test__spaceServices.run();
/* test__spaceServices */
