import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
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
import {readEntitiesService} from '$lib/vocab/entity/entityServices';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import {
	createMembershipService,
	deleteMembershipService,
} from '$lib/vocab/membership/membershipServices';
import {toServiceRequest} from '$lib/util/testHelpers';

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
	const serviceRequest = toServiceRequest(account.account_id, db);

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
	const defaultSpaces = toDefaultSpaces(persona.persona_id, community);
	const defaultSpaceCount = defaultSpaces.length;

	// create some entities
	const {entity: entity1} = await random.entity(persona, account, community, space);
	const {entity: entity2} = await random.entity(persona, account, community, space);

	// TODO create some ties

	// do queries
	//
	//
	//

	const {entities: filterFilesValue} = unwrap(
		await readEntitiesService.perform({params: {space_id: space.space_id}, ...serviceRequest}),
	);
	assert.equal(filterFilesValue.slice(), [entity2, entity1]); // `slice` because `RowList` is not deep equal to arrays

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
	assert.is(filterSpacesValue.length, spaceCount + defaultSpaceCount);

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
	assert.is(filterCommunitiesValue.length, 3);

	// TODO add a service event?
	assert.equal(
		unwrap(await db.repos.persona.filterByAccount(account.account_id))
			.sort((a, b) => (a.created < b.created ? -1 : 1))
			.slice(), // `slice` because `RowList` is not deep equal to arrays
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
