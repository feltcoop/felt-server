import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';

/* test__TieRepo */
const test__TieRepo = suite<TestDbContext & TestAppContext>('TieRepo');

test__TieRepo.before(setupDb);
test__TieRepo.after(teardownDb);

test__TieRepo('check tie queries', async ({db, random}) => {
	//Gen space
	//Gen dir entity -> thread entity -> post -> reply
	const {persona, account, community, space} = await random.space();
	const {entity: entityDir} = await random.entity(persona, account, community, space);
	const {entity: entityThread} = await random.entity(persona, account, community, space);
	const {entity: entityPost} = await random.entity(persona, account, community, space);
	const {entity: entityReply} = await random.entity(persona, account, community, space);

	const tie1 = unwrap(
		await db.repos.tie.create(entityDir.entity_id, entityThread.entity_id, 'HasThread'),
	);

	const tie2 = unwrap(
		await db.repos.tie.create(entityThread.entity_id, entityPost.entity_id, 'HasPost'),
	);

	const tie3 = unwrap(
		await db.repos.tie.create(entityPost.entity_id, entityReply.entity_id, 'HasReply'),
	);

	const query1 = unwrap(await db.repos.tie.filterBySpace(space.space_id));
	assert.is(query1.length, 3);
	assert.equal(query1, [tie1, tie2, tie3]);

	const query2 = unwrap(await db.repos.tie.filterBySourceId(entityDir.entity_id));
	assert.is(query2.length, 3);
	assert.equal(
		query2.sort((a, b) => a.source_id - b.source_id),
		[tie1, tie2, tie3].sort((a, b) => a.source_id - b.source_id),
	);
});

test__TieRepo.run();
/* test__TieRepo */
