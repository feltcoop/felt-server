import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import type {NoteEntityData} from '$lib/vocab/entity/entityData';
import {toServiceRequest} from '$lib/util/testHelpers';

import {getPaginatedEntitiesService} from '$lib/vocab/entity/entityServices';
import {unwrap} from '@feltcoop/felt';
import type {Entity} from './entity';

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

test_entityServices('get paginated data', async ({db, random}) => {
	const {space, persona, account, community} = await random.space();
	const serviceRequest = toServiceRequest(account.account_id, db);

	//first query on the space dir and expect an empty set
	const {entities: filterFilesValue} = unwrap(
		await getPaginatedEntitiesService.perform({
			params: {directory_id: space.directory_id},
			...serviceRequest,
		}),
	);

	assert.is(filterFilesValue.length, 0);

	const entities: Entity[] = [];
	for (let i = 0; i < db.DEFAULT_PAGE_SIZE + 1; i++) {
		// eslint-disable-next-line no-await-in-loop
		const {entity} = await random.entity(persona, account, community, space, {
			data: {type: 'Note', content: `This is note ${i}`},
		});
		entities.push(entity);
	}

	//test the default param returns properly
	const {entities: filterFilesValue2} = unwrap(
		await getPaginatedEntitiesService.perform({
			params: {directory_id: space.directory_id},
			...serviceRequest,
		}),
	);
	assert.is(filterFilesValue2.length, db.DEFAULT_PAGE_SIZE);

	const SMALL_PAGE_SIZE = 10;

	//then do 3 queries on pagesize 10
	const {entities: filterFilesValue3} = unwrap(
		await getPaginatedEntitiesService.perform({
			params: {directory_id: space.directory_id, pageSize: SMALL_PAGE_SIZE},
			...serviceRequest,
		}),
	);

	assert.is(filterFilesValue3.length, SMALL_PAGE_SIZE);

	const {entities: filterFilesValue4} = unwrap(
		await getPaginatedEntitiesService.perform({
			params: {
				directory_id: space.directory_id,
				pageSize: SMALL_PAGE_SIZE,
				pageKey: filterFilesValue3.at(-1)!.entity_id,
			},
			...serviceRequest,
		}),
	);

	assert.is(filterFilesValue4.length, SMALL_PAGE_SIZE);
	assert.not(filterFilesValue3.includes(filterFilesValue4[0]));

	const {entities: filterFilesValue5} = unwrap(
		await getPaginatedEntitiesService.perform({
			params: {
				directory_id: space.directory_id,
				pageSize: SMALL_PAGE_SIZE,
				pageKey: filterFilesValue4.at(-1)!.entity_id,
			},
			...serviceRequest,
		}),
	);
	assert.is(filterFilesValue5.length, 1);
});

test_entityServices.run();
/* test_entityServices */
