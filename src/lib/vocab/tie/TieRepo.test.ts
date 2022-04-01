import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {RandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';

/* test__TieRepo */
const test__TieRepo = suite<TestDbContext & TestAppContext>('TieRepo');

test__TieRepo.before(setupDb);
test__TieRepo.after(teardownDb);

test__TieRepo('check tie queries', async ({db}) => {
	//Gen space
	//Gen dir entity -> thread entity -> post -> reply
	const random = new RandomVocabContext(db);
	const {persona, account, community, space} = await random.space();
	const {entity: entityDir} = await random.entity(persona, account, community, space);
	const {entity: entityThread} = await random.entity(persona, account, community, space);
	const {entity: entityPost} = await random.entity(persona, account, community, space);
	const {entity: entityReply} = await random.entity(persona, account, community, space);

	const result1 = await db.repos.tie.create(
		entityDir.entity_id,
		entityThread.entity_id,
		'HasThread',
	);
	assert.ok(result1.ok);

	const result2 = await db.repos.tie.create(
		entityThread.entity_id,
		entityPost.entity_id,
		'HasPost',
	);
	assert.ok(result2.ok);

	const result3 = await db.repos.tie.create(
		entityPost.entity_id,
		entityReply.entity_id,
		'HasReply',
	);
	assert.ok(result3.ok);

	const query1 = await db.repos.tie.filterBySpace(space.space_id);
	assert.ok(query1.ok);
	assert.equal(query1.value.length, 3);
	assert.equal(query1.value, [result1.value, result2.value, result3.value]);

	const query2 = await db.repos.tie.filterBySourceId(entityDir.entity_id);
	assert.ok(query2.ok);
	assert.equal(query2.value.length, 3);
	assert.equal(
		query2.value.sort((a, b) => a.source_id - b.source_id),
		[result1.value, result2.value, result3.value].sort((a, b) => a.source_id - b.source_id),
	);
});

test__TieRepo.run();
/* test__TieRepo */
