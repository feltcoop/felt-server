import {suite} from 'uvu';
import * as assert from 'uvu/assert';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers';
import {toRandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';
import {deleteMembershipService} from './membershipServices';

/* test__membershipServices */
const test__membershipServices = suite<TestServerContext & TestAppContext>('membershipServices');

test__membershipServices.before(setupServer);
test__membershipServices.after(teardownServer);

test__membershipServices('delete a membership in a community', async ({server}) => {
	const random = toRandomVocabContext(server.db);
	const account = await random.account();
	const persona = await random.persona(account);
	const community1 = await random.community(persona);

	const deleteResult = await deleteMembershipService.perform({
		server,
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
