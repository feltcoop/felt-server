import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {toRandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';

/* test__entityRepo */
const test__entityRepo = suite<TestDbContext & TestAppContext>('entityRepo');

test__entityRepo.before(setupDb);
test__entityRepo.after(teardownDb);

test__entityRepo('entites return sorted by created', async ({db}) => {
	const random = toRandomVocabContext(db);
	const space = await random.space();
	const entity0 = await random.entity(undefined, undefined, undefined, space);
	const entity1 = await random.entity(undefined, undefined, undefined, space);
	const entity2 = await random.entity(undefined, undefined, undefined, space);

	assert.equal(entity0.space_id, entity1.space_id);
	assert.equal(entity1.space_id, entity2.space_id);

	// Ensure db sort order is shuffled from the insertion order.
	await db.repos.entity.updateEntityData(entity1.entity_id, entity1.data);
	const result = await db.repos.entity.filterBySpace(entity0.space_id);
	assert.ok(result.ok);
	assert.equal(entity0.entity_id, result.value[0].entity_id);
	assert.equal(entity1.entity_id, result.value[1].entity_id);
	assert.equal(entity2.entity_id, result.value[2].entity_id);
});

test__entityRepo.run();
/* test__entityRepo */
