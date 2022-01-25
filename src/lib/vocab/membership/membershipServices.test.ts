import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers';
import {toRandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {createMembershipService, deleteMembershipService} from './membershipServices';

/* test__membershipServices */
const test__membershipServices = suite<TestServerContext & TestAppContext>('membershipServices');

test__membershipServices.before(setupServer);
test__membershipServices.after(teardownServer);

test__membershipServices('disallow creating duplicate memberships', async ({server}) => {
	const random = toRandomVocabContext(server.db);
	const account = await random.account();
	const persona = await random.persona();
	const community = await random.community();

	let createMembershipResult = await createMembershipService.perform({
		repos: server.db.repos,
		account_id: account.account_id,
		params: {community_id: community.community_id, persona_id: persona.persona_id},
	});
	assert.ok(createMembershipResult.ok);

	let errorMessage;
	try {
		createMembershipResult = await createMembershipService.perform({
			repos: server.db.repos,
			account_id: account.account_id,
			params: {community_id: community.community_id, persona_id: persona.persona_id},
		});
		errorMessage = createMembershipResult.ok ? 'failed' : createMembershipResult.message;
	} catch (_err) {
		// expect this error because the repo method should throw
	}
	if (errorMessage) throw Error(errorMessage);
});

test__membershipServices(
	'disallow creating memberships for personal communities',
	async ({server}) => {
		const random = toRandomVocabContext(server.db);
		const account = await random.account();
		const persona = await random.persona();
		const community = unwrap(await server.db.repos.community.findByName(persona.name))!;
		const createMembershipResult = await createMembershipService.perform({
			repos: server.db.repos,
			account_id: account.account_id,
			params: {
				community_id: community.community_id,
				persona_id: (await random.persona()).persona_id,
			},
		});
		assert.ok(!createMembershipResult.ok);
	},
);

test__membershipServices('delete a membership in a community', async ({server}) => {
	const random = toRandomVocabContext(server.db);
	const account = await random.account();
	const persona = await random.persona(account);
	const community1 = await random.community(persona);

	const deleteResult = await deleteMembershipService.perform({
		repos: server.db.repos,
		params: {persona_id: persona.persona_id, community_id: community1.community_id},
		account_id: account.account_id,
	});
	assert.ok(deleteResult.ok);

	const findSpaceResult = await server.db.repos.membership.findById(
		persona.persona_id,
		community1.community_id,
	);
	assert.ok(!findSpaceResult.ok);
});

test__membershipServices.run();
/* test__membershipServices */
