import {suite} from 'uvu';
import * as t from 'uvu/assert';
import type {Result} from '@feltcoop/felt';

import type {TestServerContext} from '$lib/util/testHelpers';
import {setupServer, teardownServer} from '$lib/util/testHelpers';
import {validateFile} from '$lib/vocab/file/file';
import type {SpaceParams} from '$lib/vocab/space/space';
import {validateSpace} from '$lib/vocab/space/space';
import {toValidationErrorMessage} from '$lib/util/ajv';
import type {AccountParams} from '$lib/vocab/account/account';
import type {CommunityParams} from '$lib/vocab/community/community';
import {validateCommunity} from '$lib/vocab/community/community';
import {PersonaParams, validatePersona} from '$lib/vocab/persona/persona';
import type {File} from '$lib/vocab/file/file';

// TODO rename this from `seed` to something like `repos`?

// TODO this only depends on the database --
// if we don't figure out a robust way to make a global reusable server,
// then change this module to setup and teardown only a `db` instance
// instead of the whole server

// TODO automate faking these from schemas, also use seeded rng
const randomString = () => Math.random().toString().slice(2);
const randomAccountName = randomString;
const randomPassword = randomString;
const randomPersonaName = randomString;
const randomCommunnityName = randomString;
const randomSpaceUrl = randomString;
const randomSpaceName = randomString;

/* test__seed */
const test__seed = suite<TestServerContext>('seed');

test__seed.before(setupServer);
test__seed.after(teardownServer);

test__seed('create, change, and delete some data from repos', async ({server}) => {
	const content = 'hey friends';

	// create everything
	//
	//
	//

	// TODO refactor these vars -- seed?
	const accountParams: AccountParams = {name: randomAccountName(), password: randomPassword()};
	const createAccountResult = await server.db.repos.account.create(accountParams);
	if (!createAccountResult.ok) {
		throw Error(`Failed to create account: ${createAccountResult.reason}`);
	}
	const account = createAccountResult.value;

	const personaParams: PersonaParams = {
		name: randomPersonaName(),
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
		name: randomCommunnityName(),
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
		name: randomSpaceName(),
		url: randomSpaceUrl(),
	};
	const spaceResult = await server.db.repos.space.create(spaceParams);
	if (!spaceResult.ok) {
		// TODO doesn't have a `reason` like others -- do we need to add one? maybe not?
		// or maybe compose with a generic db error catcher?
		throw Error(`Failed to create space`);
	}
	const space = spaceResult.value;
	if (!validateSpace()(space)) {
		throw new Error(
			`Failed to validate space: ${toValidationErrorMessage(validateSpace().errors![0])}`,
		);
	}

	const unwrapFile = async (promise: Promise<Result<{value: File}>>): Promise<File> => {
		const createFileResult = await promise;
		t.ok(createFileResult.ok);
		if (!validateFile()(createFileResult.value)) {
			console.log('createFileResult.value', createFileResult.value);
			throw new Error(
				`Failed to validate file: ${toValidationErrorMessage(validateFile().errors![0])}`,
			);
		}
		return createFileResult.value;
	};

	const fileContent1 = 'this is file 1';
	const fileContent2 = 'file: 2';
	const file1 = await unwrapFile(
		server.db.repos.file.create({
			actor_id: persona.persona_id,
			space_id: space.space_id,
			content: fileContent1,
		}),
	);
	const file2 = await unwrapFile(
		server.db.repos.file.create({
			actor_id: persona.persona_id,
			space_id: space.space_id,
			content: fileContent2,
		}),
	);

	// do queries and changes
	//
	//
	//

	const filterFilesResult = await server.db.repos.file.filterBySpace(space.space_id);
	t.ok(filterFilesResult.ok);
	t.is(filterFilesResult.value.length, 2);
	filterFilesResult.value.forEach((f) => {
		if (!validateFile()(f)) {
			throw new Error(
				`Failed to validate file: ${toValidationErrorMessage(validateFile().errors![0])}`,
			);
		}
	});
	t.ok(filterFilesResult.ok);
	t.equal(filterFilesResult.value, [file1, file2]);

	const findSpaceResult = await server.db.repos.space.findById(space.space_id);
	t.ok(findSpaceResult.ok);
	t.equal(findSpaceResult.value, space);
	if (!validateSpace()(findSpaceResult.value)) {
		throw new Error(
			`Failed to validate space: ${toValidationErrorMessage(validateSpace().errors![0])}`,
		);
	}
	const filterSpacesResult = await server.db.repos.space.filterByCommunity(community.community_id);
	t.ok(filterSpacesResult.ok);
	t.equal(filterSpacesResult.value.length, 8); // TODO do a better check
	filterSpacesResult.value.forEach((s) => {
		if (!validateSpace()(s)) {
			throw new Error(
				`Failed to validate space: ${toValidationErrorMessage(validateSpace().errors![0])}`,
			);
		}
	});

	const findCommunityResult = await server.db.repos.community.findById(community.community_id);
	t.ok(findCommunityResult.ok);
	t.is(findCommunityResult.value.name, community.name); // TODO a better check
	if (!validateCommunity()(findCommunityResult.value)) {
		throw new Error(
			`Failed to validate community: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
		);
	}
	const filterCommunitysResult = await server.db.repos.community.filterByAccount(
		account.account_id,
	);
	t.ok(filterCommunitysResult.ok);
	t.equal(filterCommunitysResult.value.length, 4); // TODO do a better check
	filterCommunitysResult.value.forEach((s) => {
		if (!validateCommunity()(s)) {
			throw new Error(
				`Failed to validate community: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
			);
		}
	});

	// delete everything
	//
	//
	//

	// TODO implement
	// const deleteFileResult = await server.db.repos.file.delete(
	// 	account.account_id,
	// 	space.space_id,
	// 	content,
	// );
	// t.ok(deleteFileResult.ok);

	// TODO check to be sure the database has the same rows as when it started --
	// maybe do this with before/after hooks?
});

test__seed.run();
/* test__seed */
