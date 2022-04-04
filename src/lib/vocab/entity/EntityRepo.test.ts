import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {RandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';

/* test__EntityRepo */
const test__EntityRepo = suite<TestDbContext & TestAppContext>('EntityRepo');

test__EntityRepo.before(setupDb);
test__EntityRepo.after(teardownDb);

test__EntityRepo('entites return sorted by created', async ({db}) => {
	const random = new RandomVocabContext(db);
	const {space, persona, account} = await random.space();
	const {entity: entity0} = await random.entity(persona, account, undefined, space);
	const {entity: entity1} = await random.entity(persona, account, undefined, space);
	const {entity: entity2} = await random.entity(persona, account, undefined, space);

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

test__EntityRepo.run();
/* test__EntityRepo */
