import {suite} from 'uvu';
import * as t from 'uvu/assert';

import type {TestServerContext} from '$lib/util/testHelpers';
import {setupServer, teardownServer} from '$lib/util/testHelpers';
import {validateFile} from '$lib/vocab/file/file';
import {toValidationErrorMessage} from '$lib/util/ajv';
import type {SpaceParams} from '$lib/vocab/space/space';
import type {AccountParams} from '$lib/vocab/account/account';
import type {CommunityParams} from '$lib/vocab/community/community';
import {PersonaParams, validatePersona} from '$lib/vocab/persona/persona';

// TODO this only depends on the database --
// if we don't figure out a robust way to make a global reusable server,
// then change this module to setup and teardown only a `db` instance
// instead of the whole server

/* test__seed */
const test__seed = suite<TestServerContext>('seed');

test__seed.before(setupServer);
test__seed.after(teardownServer);

test__seed('create, change, and delete some data from repos', async ({server}) => {
	const content = 'hey friends';

	// TODO refactor these vars -- seed?
	const accountParams: AccountParams = {name: 'alice', password: 'password'};
	const createAccountResult = await server.db.repos.account.create(accountParams);
	if (!createAccountResult.ok) {
		throw Error(`Failed to create account: ${createAccountResult.reason}`);
	}
	const account = createAccountResult.value;

	const personaParams: PersonaParams = {
		name: 'alias',
		account_id: account.account_id,
	};
	const personaResult = await server.db.repos.persona.create(personaParams);
	if (!personaResult.ok) {
		// TODO doesn't have a `reason` like others -- do we need to add one? maybe not?
		// or maybe compose with a generic db error catcher?
		throw Error(`Failed to create persona`);
	}
	const {persona, community: personaHomeCommunity} = personaResult.value;
	if (!validatePersona()(persona)) {
		console.log('TODO throw error here after merging with other changes'); // TODO
		// throw new Error(
		// 	`Failed to validate file: ${toValidationErrorMessage(validatePersona().errors![0])}`,
		// );
	}
	t.ok(personaHomeCommunity); // TODO add schema (change return type tho? it joins a lot of stuff currently)
	// if (!validateCommunity()(personaHomeCommunity)) {
	// 	throw new Error(
	// 		`Failed to validate file: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
	// 	);
	// }

	const communityParams: CommunityParams = {
		name: 'inside',
		persona_id: persona.persona_id,
	};
	const communityResult = await server.db.repos.community.create(communityParams);
	if (!communityResult.ok) {
		// TODO doesn't have a `reason` like others -- do we need to add one? maybe not?
		// or maybe compose with a generic db error catcher?
		throw Error(`Failed to create community`);
	}
	const community = communityResult.value;

	const spaceParams: SpaceParams = {
		community_id: community.community_id,
		content,
		media_type: 'text/plain',
		name: 'outer space',
		url: '/outer/space',
	};
	const spaceResult = await server.db.repos.space.create(spaceParams);
	if (!spaceResult.ok) {
		// TODO doesn't have a `reason` like others -- do we need to add one? maybe not?
		// or maybe compose with a generic db error catcher?
		throw Error(`Failed to create space`);
	}
	const space = spaceResult.value;

	const result = await server.db.repos.file.create(account.account_id, space.space_id, content);
	t.ok(result.ok);
	if (!validateFile()(result.value)) {
		throw new Error(
			`Failed to validate file: ${toValidationErrorMessage(validateFile().errors![0])}`,
		);
	}

	// TODO check to be sure the database has the same rows as when it started --
	// maybe do this with before/after hooks?
});

test__seed.run();
/* test__seed */
