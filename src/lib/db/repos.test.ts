import {suite} from 'uvu';
import * as t from 'uvu/assert';
import type {Result} from '@feltcoop/felt';
import {unwrap} from '@feltcoop/felt';

import type {TestServerContext} from '$lib/util/testHelpers';
import {setupServer, teardownServer} from '$lib/util/testHelpers';
import {validateFile} from '$lib/vocab/file/file';
import {validateSpace} from '$lib/vocab/space/space';
import {toValidationErrorMessage} from '$lib/util/ajv';
import {validateAccount} from '$lib/vocab/account/account';
import {validateCommunity} from '$lib/vocab/community/community';
import {validatePersona} from '$lib/vocab/persona/persona';
import type {File} from '$lib/vocab/file/file';
import {
	randomAccountParams,
	randomCommunityParams,
	randomPersonaParams,
	randomSpaceParams,
} from '$lib/vocab/random';

// TODO this only depends on the database --
// if we don't figure out a robust way to make a global reusable server,
// then change this module to setup and teardown only a `db` instance
// instead of the whole server

/* test__repos */
const test__repos = suite<TestServerContext>('repos');

test__repos.before(setupServer);
test__repos.after(teardownServer);

test__repos('create, change, and delete some data from repos', async ({server}) => {
	// create everything
	//
	//
	//
	const accountParams = randomAccountParams();
	const account = unwrap(await server.db.repos.account.create(accountParams));

	const personaParams = randomPersonaParams(account.account_id);
	const {persona, community: personaHomeCommunity} = unwrap(
		await server.db.repos.persona.create(personaParams),
	);
	if (!validatePersona()(persona)) {
		console.log('TODO throw error here after merging with other changes'); // TODO
		// throw new Error(
		// 	`Failed to validate file: ${toValidationErrorMessage(validatePersona().errors![0])}`,
		// );
	}
	t.ok(personaHomeCommunity);
	if (!validateCommunity()(personaHomeCommunity)) {
		throw new Error(
			`Failed to validate file: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
		);
	}

	const communityParams = randomCommunityParams(persona.persona_id);
	const community = unwrap(await server.db.repos.community.create(communityParams));

	const spaceParams = randomSpaceParams(community.community_id);
	const space = unwrap(await server.db.repos.space.create(spaceParams));
	if (!validateSpace()(space)) {
		throw new Error(
			`Failed to validate space: ${toValidationErrorMessage(validateSpace().errors![0])}`,
		);
	}

	const unwrapFile = async (promise: Promise<Result<{value: File}>>): Promise<File> => {
		const file = unwrap(await promise);
		if (!validateFile()(file)) {
			throw new Error(
				`Failed to validate file: ${toValidationErrorMessage(validateFile().errors![0])}`,
			);
		}
		return file;
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

	// do queries
	//
	//
	//

	const filterFilesValue = unwrap(await server.db.repos.file.filterBySpace(space.space_id));
	t.is(filterFilesValue.length, 2);
	filterFilesValue.forEach((f) => {
		if (!validateFile()(f)) {
			throw new Error(
				`Failed to validate file: ${toValidationErrorMessage(validateFile().errors![0])}`,
			);
		}
	});
	t.equal(filterFilesValue, [file1, file2]);

	const findSpaceValue = unwrap(await server.db.repos.space.findById(space.space_id));
	t.equal(findSpaceValue, space);
	if (!validateSpace()(findSpaceValue)) {
		throw new Error(
			`Failed to validate space: ${toValidationErrorMessage(validateSpace().errors![0])}`,
		);
	}
	const filterSpacesValue = unwrap(
		await server.db.repos.space.filterByCommunity(community.community_id),
	);
	t.equal(filterSpacesValue.length, 8); // TODO do a better check
	filterSpacesValue.forEach((s) => {
		if (!validateSpace()(s)) {
			throw new Error(
				`Failed to validate space: ${toValidationErrorMessage(validateSpace().errors![0])}`,
			);
		}
	});

	const findCommunityValue = unwrap(
		await server.db.repos.community.findById(community.community_id),
	);
	t.is(findCommunityValue.name, community.name); // TODO a better check
	if (!validateCommunity()(findCommunityValue)) {
		throw new Error(
			`Failed to validate community: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
		);
	}
	const filterCommunitiesValue = unwrap(
		await server.db.repos.community.filterByAccount(account.account_id),
	);
	t.equal(filterCommunitiesValue.length, 4); // TODO do a better check
	filterCommunitiesValue.forEach((s) => {
		if (!validateCommunity()(s)) {
			throw new Error(
				`Failed to validate community: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
			);
		}
	});

	const filterPersonasValue = unwrap(
		await server.db.repos.persona.filterByAccount(account.account_id),
	);
	t.is(filterPersonasValue.length, 2); // TODO fix this after merge
	t.is(filterPersonasValue[1].name, persona.name); // TODO fix this after merge
	filterPersonasValue.forEach((p) => {
		if (!validatePersona()(p)) {
			throw new Error(
				`Failed to validate persona: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
			);
		}
	});

	const findAccountByIdValue = unwrap(await server.db.repos.account.findById(account.account_id));
	t.is(findAccountByIdValue.name, account.name); // TODO a better check
	if (!validateAccount()(findAccountByIdValue)) {
		throw new Error(
			`Failed to validate account: ${toValidationErrorMessage(validateAccount().errors![0])}`,
		);
	}
	const findAccountByNameValue = unwrap(await server.db.repos.account.findByName(account.name));
	t.is(findAccountByNameValue.name, account.name); // TODO a better check
	if (!validateAccount()(findAccountByNameValue)) {
		throw new Error(
			`Failed to validate account: ${toValidationErrorMessage(validateAccount().errors![0])}`,
		);
	}

	// do changes
	//
	//
	//

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

	// TODO check to be sure the database has the same # rows in each table as when this test started --
	// maybe do this with before/after hooks so it's easily reused?
});

test__repos.run();
/* test__repos */
