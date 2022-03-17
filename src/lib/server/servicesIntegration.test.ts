import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {
	randomAccountParams,
	randomCommunityParams,
	randomPersonaParams,
	randomSpaceParams,
} from '$lib/vocab/random';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import type {NoteEntityData} from '$lib/vocab/entity/entityData';
import {createAccountPersonaService} from '$lib/vocab/persona/personaServices';
import {SessionApi} from '$lib/server/SessionApi';
import {
	createCommunityService,
	readCommunitiesService,
	readCommunityService,
} from '$lib/vocab/community/communityServices';
import {
	createSpaceService,
	readSpaceService,
	readSpacesService,
} from '$lib/vocab/space/spaceServices';
import {createEntityService, readEntitiesService} from '$lib/vocab/entity/entityServices';

/* test_servicesIntegration */
const test_servicesIntegration = suite<TestDbContext>('repos');

test_servicesIntegration.before(setupDb);
test_servicesIntegration.after(teardownDb);

test_servicesIntegration('create, change, and delete some data from repos', async ({db}) => {
	// create everything
	//
	//
	//
	const accountParams = randomAccountParams();
	const account = unwrap(await db.repos.account.create(accountParams.name, accountParams.password));

	// This is a reusable request context for all `service.perform` calls.
	const serviceRequest = {
		account_id: account.account_id,
		repos: db.repos,
		session: new SessionApi(null),
	};

	// TODO create 2 personas
	const personaParams = randomPersonaParams();
	const {persona, community: personaHomeCommunity} = unwrap(
		await createAccountPersonaService.perform({
			params: {name: personaParams.name},
			...serviceRequest,
		}),
	);
	assert.ok(personaHomeCommunity);

	const communityParams = randomCommunityParams(persona.persona_id);
	const {community} = unwrap(
		await createCommunityService.perform({
			params: {name: communityParams.name, persona_id: communityParams.persona_id},
			...serviceRequest,
		}),
	);

	const spaceParams = randomSpaceParams(community.community_id);
	const {space} = unwrap(
		await createSpaceService.perform({params: spaceParams, ...serviceRequest}),
	);
	const spaceCount = 1;
	const defaultSpaces = toDefaultSpaces(community);
	const defaultSpaceCount = defaultSpaces.length;

	const entityData1: NoteEntityData = {type: 'Note', content: 'this is entity 1'};
	const entityData2: NoteEntityData = {type: 'Note', content: 'entity: 2'};
	const {entity: entity1} = unwrap(
		await createEntityService.perform({
			params: {actor_id: persona.persona_id, space_id: space.space_id, data: entityData1},
			...serviceRequest,
		}),
	);
	const {entity: entity2} = unwrap(
		await createEntityService.perform({
			params: {actor_id: persona.persona_id, space_id: space.space_id, data: entityData2},
			...serviceRequest,
		}),
	);
	assert.is(entity1.actor_id, persona.persona_id);
	assert.is(entity2.actor_id, persona.persona_id);
	assert.is(entity1.space_id, space.space_id);
	assert.is(entity2.space_id, space.space_id);
	assert.equal(entity1.data, entityData1);
	assert.equal(entity2.data, entityData2);

	// do queries
	//
	//
	//

	const {entities: filterFilesValue} = unwrap(
		await readEntitiesService.perform({params: {space_id: space.space_id}, ...serviceRequest}),
	);
	assert.is(filterFilesValue.length, 2);
	assert.equal(filterFilesValue, [entity1, entity2]);

	const {space: findSpaceValue} = unwrap(
		await readSpaceService.perform({params: {space_id: space.space_id}, ...serviceRequest}),
	);
	assert.equal(findSpaceValue, space);

	const {spaces: filterSpacesValue} = unwrap(
		await readSpacesService.perform({
			params: {community_id: community.community_id},
			...serviceRequest,
		}),
	);
	assert.equal(filterSpacesValue.length, spaceCount + defaultSpaceCount);

	const {community: findCommunityValue} = unwrap(
		await readCommunityService.perform({
			params: {community_id: community.community_id},
			...serviceRequest,
		}),
	);
	assert.is(findCommunityValue.name, community.name);

	const {communities: filterCommunitiesValue} = unwrap(
		await readCommunitiesService.perform({
			params: {account_id: account.account_id},
			...serviceRequest,
		}),
	);
	assert.equal(filterCommunitiesValue.length, 2);

	// TODO add a service event?
	const filterPersonasValue = unwrap(await db.repos.persona.filterByAccount(account.account_id));
	assert.is(filterPersonasValue.length, 1);
	assert.equal(filterPersonasValue, [persona]);

	// TODO add a service event?
	const findAccountByIdValue = unwrap(await db.repos.account.findById(account.account_id));
	assert.is(findAccountByIdValue.name, account.name);

	// TODO add a service event?
	const findAccountByNameValue = unwrap(await db.repos.account.findByName(account.name));
	assert.is(findAccountByNameValue.name, account.name);

	// do changes
	//
	//
	//

	// TODO implement for entities
	// const deleteFileResult = await db.repos.entity.delete(
	// 	account.account_id,
	// 	space.space_id,
	// 	content,
	// );
	// assert.ok(deleteFileResult.ok);

	await Promise.all(
		filterSpacesValue.map(async (space) => unwrap(await db.repos.space.deleteById(space.space_id))),
	);
	const deletedSpaceResult = await db.repos.space.filterByCommunity(community.community_id);
	assert.is(unwrap(deletedSpaceResult).length, 0);

	assert.is(
		unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
		2,
	);
	const deletedMembershipResult = await db.repos.membership.deleteById(
		persona.persona_id,
		community.community_id,
	);
	assert.ok(deletedMembershipResult.ok);
	assert.is(
		unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
		1,
	);

	// TODO delete communities here

	// TODO delete personas here

	// TODO delete accounts here

	// TODO check to be sure the database has the same # rows in each table as when this test started --
	// maybe do this with before/after hooks so it's easily reused?
});

test_servicesIntegration.run();
/* test_servicesIntegration */
