import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import type {NoteEntityData} from '$lib/vocab/entity/entityData';
import {SessionApiMock} from '$lib/server/SessionApiMock';
import {
	readCommunitiesService,
	readCommunityService,
	deleteCommunityService,
} from '$lib/vocab/community/communityServices';
import {
	deleteSpaceService,
	readSpaceService,
	readSpacesService,
} from '$lib/vocab/space/spaceServices';
import {createEntityService, readEntitiesService} from '$lib/vocab/entity/entityServices';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import {
	createMembershipService,
	deleteMembershipService,
} from '$lib/vocab/membership/membershipServices';

/* test_servicesIntegration */
const test_servicesIntegration = suite<TestDbContext>('repos');

test_servicesIntegration.before(setupDb);
test_servicesIntegration.after(teardownDb);

test_servicesIntegration('services integration test', async ({db, random}) => {
	// create everything
	//
	//
	//
	const account = await random.account();

	// This is a reusable request context for all `service.perform` calls.
	const serviceRequest = {
		account_id: account.account_id,
		repos: db.repos,
		session: new SessionApiMock(),
	};

	// create a persona
	const {persona, personalCommunity} = await random.persona(account);
	assert.ok(personalCommunity);

	// create a second persona
	const {persona: persona2} = await random.persona(account);

	// create community
	const {community} = await random.community(persona);

	// join the community with the second persona
	unwrap(
		await createMembershipService.perform({
			params: {community_id: community.community_id, persona_id: persona2.persona_id},
			...serviceRequest,
		}),
	);

	// create a space
	const {space} = await random.space(persona, account, community);
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
	assert.equal(filterCommunitiesValue.length, 3);

	// TODO add a service event?
	assert.equal(
		unwrap(await db.repos.persona.filterByAccount(account.account_id)).sort((a, b) =>
			a.created < b.created ? -1 : 1,
		),
		[persona, persona2],
	);

	// TODO add a service event?
	assert.is(unwrap(await db.repos.account.findById(account.account_id)).name, account.name);

	// TODO add a service event?
	assert.is(unwrap(await db.repos.account.findByName(account.name)).name, account.name);

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

	// delete spaces except the home space
	await Promise.all(
		filterSpacesValue
			.filter((s) => !isHomeSpace(s))
			.map(async (space) =>
				unwrap(
					await deleteSpaceService.perform({
						params: {space_id: space.space_id},
						...serviceRequest,
					}),
				),
			),
	);
	assert.is(unwrap(await db.repos.space.filterByCommunity(community.community_id)).length, 1);

	// delete membership
	assert.is(
		unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
		3,
	);
	unwrap(
		await deleteMembershipService.perform({
			params: {persona_id: persona2.persona_id, community_id: community.community_id},
			...serviceRequest,
		}),
	);
	assert.is(
		unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
		2,
	);
	assert.is(
		unwrap(
			await db.repos.membership.filterAccountPersonaMembershipsByCommunityId(
				community.community_id,
			),
		).length,
		1,
	);

	// delete community
	unwrap(
		await deleteCommunityService.perform({
			params: {community_id: community.community_id},
			...serviceRequest,
		}),
	);
	const readCommunityResult = await readCommunityService.perform({
		params: {community_id: community.community_id},
		...serviceRequest,
	});
	assert.is(readCommunityResult.status, 404);
	assert.is(
		unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
		0,
	);

	// TODO delete personas here

	// TODO delete accounts here

	// TODO check to be sure the database has the same # rows in each table as when this test started --
	// maybe do this with before/after hooks so it's easily reused?
});

test_servicesIntegration.run();
/* test_servicesIntegration */
