import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import type {NoteEntityData} from '$lib/vocab/entity/entityData';

/* test_entityServices */
const test_entityServices = suite<TestDbContext & TestAppContext>('communityRepo');

test_entityServices.before(setupDb);
test_entityServices.after(teardownDb);

test_entityServices('create entities with data', async ({random}) => {
	const {space, persona, account, community} = await random.space();

	const entityData1: NoteEntityData = {type: 'Note', content: 'this is entity 1'};
	const entityData2: NoteEntityData = {type: 'Note', content: 'entity: 2'};
	const {entity: entity1} = await random.entity(persona, account, community, space, {
		data: entityData1,
	});
	const {entity: entity2} = await random.entity(persona, account, community, space, {
		data: entityData2,
	});
	assert.is(entity1.actor_id, persona.persona_id);
	assert.is(entity2.actor_id, persona.persona_id);
	assert.is(entity1.space_id, space.space_id);
	assert.is(entity2.space_id, space.space_id);
	assert.equal(entity1.data, entityData1);
	assert.equal(entity2.data, entityData2);
});

test_entityServices.run();
/* test_entityServices */
