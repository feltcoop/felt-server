import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import {unwrap} from '@feltcoop/felt';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers';
import {toRandomVocabContext} from '$lib/vocab/random';
import type {TestAppContext} from '$lib/util/testAppHelpers';

/* test__membershipRepo */
const test__membershipRepo = suite<TestServerContext & TestAppContext>('membershipRepo');

test__membershipRepo.before(setupServer);
test__membershipRepo.after(teardownServer);

test__membershipRepo('disallow creating duplicate memberships', async ({server}) => {
	const random = toRandomVocabContext(server.db);
	const persona = await random.persona();
	const community = await random.community();

	let createMembershipResult = await server.db.repos.membership.create({
		community_id: community.community_id,
		persona_id: persona.persona_id,
	});
	assert.ok(createMembershipResult.ok);

	let errorMessage;
	try {
		createMembershipResult = await server.db.repos.membership.create({
			community_id: community.community_id,
			persona_id: persona.persona_id,
		});
		errorMessage = createMembershipResult.ok ? 'failed' : createMembershipResult.reason;
	} catch (_err) {
		// expect this error because the repo method should throw
	} finally {
		if (errorMessage) throw Error(errorMessage);
	}
});

test__membershipRepo('disallow creating memberships for personal communities', async ({server}) => {
	const random = toRandomVocabContext(server.db);
	const persona = await random.persona();
	const community = unwrap(await server.db.repos.community.findByName(persona.name))!;

	const createMembershipResult = await server.db.repos.membership.create({
		community_id: community.community_id,
		persona_id: (await random.persona()).persona_id,
	});
	assert.ok(!createMembershipResult.ok);
});

test__membershipRepo.run();
/* test__membershipRepo */
