import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import {
	ReadCommunitiesService,
	ReadCommunityService,
	DeleteCommunityService,
} from '$lib/vocab/community/communityServices';
import {
	DeleteSpaceService,
	ReadSpaceService,
	ReadSpacesService,
} from '$lib/vocab/space/spaceServices';
import {ReadEntitiesService} from '$lib/vocab/entity/entityServices';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import {
	CreateMembershipService,
	DeleteMembershipService,
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
		await CreateMembershipService.perform({
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
	const {entity: entity1} = await random.entity(persona, account, community, space.directory_id);
	const {entity: entity2} = await random.entity(persona, account, community, space.directory_id);

	// TODO create some ties

	// do queries
	//
	//
	//

	const {entities: filteredEntities} = unwrap(
		await ReadEntitiesService.perform({params: {source_id: space.directory_id}, ...serviceRequest}),
	);
	assert.equal(filteredEntities.slice(), [entity2, entity1]); // `slice` because `RowList` is not deep equal to arrays

	const {space: foundSpace} = unwrap(
		await ReadSpaceService.perform({params: {space_id: space.space_id}, ...serviceRequest}),
	);
	assert.equal(foundSpace, space);

	const {spaces: filteredSpaces} = unwrap(
		await ReadSpacesService.perform({
			params: {community_id: community.community_id},
			...serviceRequest,
		}),
	);
	assert.is(filteredSpaces.length, spaceCount + defaultSpaceCount);

	const {community: foundCommunity} = unwrap(
		await ReadCommunityService.perform({
			params: {community_id: community.community_id},
			...serviceRequest,
		}),
	);
	assert.is(foundCommunity.name, community.name);

	const {communities: filteredCommunities} = unwrap(
		await ReadCommunitiesService.perform({
			params: {account_id: account.account_id},
			...serviceRequest,
		}),
	);
	assert.is(filteredCommunities.length, 3);

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

	// TODO delete entities here

	// delete spaces except the home space
	for (const space of filteredSpaces) {
		if (!isHomeSpace(space)) {
			unwrap(
				// eslint-disable-next-line no-await-in-loop
				await DeleteSpaceService.perform({
					params: {space_id: space.space_id},
					...serviceRequest,
				}),
			);
		}
	}
	assert.is(unwrap(await db.repos.space.filterByCommunity(community.community_id)).length, 1);

	// delete membership
	assert.is(
		unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
		3,
	);
	unwrap(
		await DeleteMembershipService.perform({
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
		await DeleteCommunityService.perform({
			params: {community_id: community.community_id},
			...serviceRequest,
		}),
	);
	const readCommunityResult = await ReadCommunityService.perform({
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
