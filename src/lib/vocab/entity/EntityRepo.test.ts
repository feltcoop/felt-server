import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';

/* test__EntityRepo */
const test__EntityRepo = suite<TestDbContext & TestAppContext>('EntityRepo');

test__EntityRepo.before(setupDb);
test__EntityRepo.after(teardownDb);

test__EntityRepo('entites return sorted by descending id', async ({db, random}) => {
	const {space, persona, account} = await random.space();
	const {entity: entity0} = await random.entity(persona, account, undefined, space.directory_id);
	const {entity: entity1} = await random.entity(persona, account, undefined, space.directory_id);
	const {entity: entity2} = await random.entity(persona, account, undefined, space.directory_id);

	// Ensure db sort order is shuffled from the insertion order.
	unwrap(await db.repos.entity.updateEntityData(entity1.entity_id, entity1.data));
	const entities = unwrap(
		await db.repos.entity.filterByIds([entity0.entity_id, entity2.entity_id, entity1.entity_id]),
	);
	assert.equal(entity2.entity_id, entities[0].entity_id);
	assert.equal(entity1.entity_id, entities[1].entity_id);
	assert.equal(entity0.entity_id, entities[2].entity_id);
});

test__EntityRepo.run();
/* test__EntityRepo */
