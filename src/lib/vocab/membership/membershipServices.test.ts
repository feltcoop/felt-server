import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap, unwrapError} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {
	createMembershipService,
	deleteMembershipService,
} from '$lib/vocab/membership/membershipServices';
import {SessionApiMock} from '$lib/server/SessionApiMock';

/* test__membershipServices */
const test__membershipServices = suite<TestDbContext & TestAppContext>('membershipServices');

test__membershipServices.before(setupDb);
test__membershipServices.after(teardownDb);

const serviceRequest = (account_id: number, db: any) => {
	return {
		account_id,
		repos: db.repos,
		session: new SessionApiMock(),
	};
};

test__membershipServices('disallow creating duplicate memberships', async ({db, random}) => {
	const {community, persona, account} = await random.community();
	unwrapError(
		await createMembershipService.perform({
			repos: db.repos,
			account_id: account.account_id,
			params: {community_id: community.community_id, persona_id: persona.persona_id},
			session: new SessionApiMock(),
		}),
	);
});

test__membershipServices(
	'disallow creating memberships for personal communities',
	async ({db, random}) => {
		const {account, personalCommunity} = await random.persona();
		unwrapError(
			await createMembershipService.perform({
				repos: db.repos,
				account_id: account.account_id,
				params: {
					community_id: personalCommunity.community_id,
					persona_id: (await random.persona()).persona.persona_id,
				},
				session: new SessionApiMock(),
			}),
		);
	},
);

test__membershipServices('delete a membership in a community', async ({db, random}) => {
	const {community, persona, account} = await random.community();
	unwrap(
		await deleteMembershipService.perform({
			repos: db.repos,
			params: {persona_id: persona.persona_id, community_id: community.community_id},
			account_id: account.account_id,
			session: new SessionApiMock(),
		}),
	);
	unwrapError(await db.repos.membership.findById(persona.persona_id, community.community_id));
});

test__membershipServices('fail to delete a personal membership', async ({db, random}) => {
	const {persona, account} = await random.persona();
	unwrapError(
		await deleteMembershipService.perform({
			repos: db.repos,
			params: {persona_id: persona.persona_id, community_id: persona.community_id},
			account_id: account.account_id,
			session: new SessionApiMock(),
		}),
	);
	unwrap(await db.repos.membership.findById(persona.persona_id, persona.community_id));
});

test__membershipServices('fail to delete a community persona membership', async ({db, random}) => {
	const {community, communityPersona, account} = await random.community();
	unwrapError(
		await deleteMembershipService.perform({
			repos: db.repos,
			params: {persona_id: communityPersona.persona_id, community_id: community.community_id},
			account_id: account.account_id,
			session: new SessionApiMock(),
		}),
	);
	unwrap(await db.repos.membership.findById(communityPersona.persona_id, community.community_id));
});

test__membershipServices(
	'delete orphaned communities on last member leaving',
	async ({db, random}) => {
		//Need a community with two account members
		const {persona: persona1, account} = await random.persona();
		const {community} = await random.community(persona1);
		const {persona: persona2} = await random.persona();
		unwrap(
			await createMembershipService.perform({
				params: {persona_id: persona2.persona_id, community_id: community.community_id},
				...serviceRequest(account.account_id, db),
			}),
		);
		assert.is(
			unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
			3,
		);

		//Delete 1 account member, the community still exists
		unwrap(
			await deleteMembershipService.perform({
				repos: db.repos,
				params: {persona_id: persona2.persona_id, community_id: community.community_id},
				account_id: account.account_id,
				session: new SessionApiMock(),
			}),
		);
		assert.is(
			unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
			2,
		);
		unwrap(await db.repos.community.findById(community.community_id));

		//Delete last account member, the community is deleted
		unwrap(
			await deleteMembershipService.perform({
				repos: db.repos,
				params: {persona_id: persona1.persona_id, community_id: community.community_id},
				account_id: account.account_id,
				session: new SessionApiMock(),
			}),
		);

		assert.is(
			unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
			0,
		);
		unwrapError(await db.repos.community.findById(community.community_id));
	},
);

test__membershipServices.run();
/* test__membershipServices */
