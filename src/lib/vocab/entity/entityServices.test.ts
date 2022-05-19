import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import type {NoteEntityData} from '$lib/vocab/entity/entityData';
import {toServiceRequest} from '$lib/util/testHelpers';
import {ReadEntitiesPaginatedService} from '$lib/vocab/entity/entityServices';
import {DEFAULT_PAGE_SIZE} from '$lib/server/constants';
import {validateSchema} from '$lib/util/ajv';

/* test_entityServices */
const test_entityServices = suite<TestDbContext & TestAppContext>('communityRepo');

test_entityServices.before(setupDb);
test_entityServices.after(teardownDb);

test_entityServices('create entities with data', async ({random}) => {
	const {space, persona, account, community} = await random.space();

	const entityData1: NoteEntityData = {type: 'Note', content: 'this is entity 1'};
	const entityData2: NoteEntityData = {type: 'Note', content: 'entity: 2'};
	const {entity: entity1, tie: tie1} = await random.entity(persona, account, community, space, {
		data: entityData1,
	});
	const {entity: entity2, tie: tie2} = await random.entity(persona, account, community, space, {
		data: entityData2,
	});
	assert.is(entity1.actor_id, persona.persona_id);
	assert.is(entity2.actor_id, persona.persona_id);
	assert.equal(entity1.data, entityData1);
	assert.equal(entity2.data, entityData2);
	assert.is(tie1.source_id, tie2.source_id);
	assert.is(tie1.source_id, space.directory_id);
	assert.is(tie1.dest_id, entity1.entity_id);
	assert.is(tie2.dest_id, entity2.entity_id);
});

test_entityServices('read paginated entities by source_id', async ({db, random}) => {
	const {space, persona, account, community} = await random.space();
	const serviceRequest = toServiceRequest(account.account_id, db);

	//first query on the space dir and expect an empty set
	const {entities: filtered} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			params: {source_id: space.directory_id},
			...serviceRequest,
		}),
	);

	assert.is(filtered.length, 0);

	const entities = (
		await Promise.all(
			Array.from({length: DEFAULT_PAGE_SIZE + 1}, (_, i) =>
				random.entity(persona, account, community, space, {
					data: {type: 'Note', content: `This is note ${i}`},
				}),
			),
		)
	)
		.map((v) => v.entity)
		.sort((a, b) => b.entity_id - a.entity_id);

	//test the default param returns properly
	const {entities: filtered2} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			params: {source_id: space.directory_id},
			...serviceRequest,
		}),
	);
	assert.is(filtered2.length, DEFAULT_PAGE_SIZE);
	assert.equal(filtered2.slice(), entities.slice(0, -1));

	const FIRST_PAGE_SIZE = Math.floor(DEFAULT_PAGE_SIZE / 2);
	const SECOND_PAGE_SIZE = Math.ceil(DEFAULT_PAGE_SIZE / 2);

	//then do 3 queries on smaller pages
	const {entities: filtered3} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			params: {source_id: space.directory_id, pageSize: FIRST_PAGE_SIZE},
			...serviceRequest,
		}),
	);

	assert.is(filtered3.length, FIRST_PAGE_SIZE);

	const {entities: filtered4} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			params: {
				source_id: space.directory_id,
				pageSize: SECOND_PAGE_SIZE,
				pageKey: filtered3.at(-1)!.entity_id,
			},
			...serviceRequest,
		}),
	);

	assert.is(filtered4.length, SECOND_PAGE_SIZE);
	assert.ok(!filtered3.find((v) => v.entity_id === filtered4[0].entity_id));

	const {entities: filtered5} = unwrap(
		await ReadEntitiesPaginatedService.perform({
			params: {
				source_id: space.directory_id,
				pageSize: SECOND_PAGE_SIZE,
				pageKey: filtered4.at(-1)!.entity_id,
			},
			...serviceRequest,
		}),
	);
	assert.is(filtered5.length, 1);

	assert.equal(filtered3.concat(filtered4).concat(filtered5), entities);
});

//TODO move to event tests if/when that happens
test_entityServices('assert default as max pageSize', async ({random}) => {
	const {space} = await random.space();

	const validateParams = validateSchema(ReadEntitiesPaginatedService.event.params);
	assert.ok(!validateParams({source_id: space.directory_id, pageSize: DEFAULT_PAGE_SIZE + 1}));
});

test_entityServices.run();
/* test_entityServices */
