import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import type {Result} from '@feltcoop/felt';
import {unwrap} from '@feltcoop/felt';

import type {TestServerContext} from '$lib/util/testServerHelpers';
import {setupServer, teardownServer} from '$lib/util/testServerHelpers';
import {validateEntity} from '$lib/vocab/entity/validateEntity';
import {validateSpace} from '$lib/vocab/space/validateSpace';
import {toValidationErrorMessage} from '$lib/util/ajv';
import {validateAccount, validateAccountModel} from '$lib/vocab/account/validateAccount';
import {validateCommunity} from '$lib/vocab/community/validateCommunity';
import {validatePersona} from '$lib/vocab/persona/validatePersona';
import type {Entity} from '$lib/vocab/entity/entity';
import {
	randomAccountParams,
	randomCommunityParams,
	randomPersonaParams,
	randomSpaceParams,
} from '$lib/vocab/random';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';

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

	// TODO create 2 personas
	const personaParams = randomPersonaParams();
	const {persona, community: personaHomeCommunity} = unwrap(
		await server.db.repos.persona.create(personaParams.name, account.account_id),
	);
	if (!validatePersona()(persona)) {
		throw new Error(
			`Failed to validate persona: ${toValidationErrorMessage(validatePersona().errors![0])}`,
		);
	}
	assert.ok(personaHomeCommunity);
	if (!validateCommunity()(personaHomeCommunity)) {
		throw new Error(
			`Failed to validate community: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
		);
	}

	const communityParams = randomCommunityParams(persona.persona_id);
	const community = unwrap(
		await server.db.repos.community.create(
			communityParams.name,
			communityParams.persona_id,
			communityParams.settings!,
		),
	);
	persona.community_ids.push(community.community_id); // TODO hacky

	const spaceParams = randomSpaceParams(community.community_id);
	const space = unwrap(await server.db.repos.space.create(spaceParams));
	if (!validateSpace()(space)) {
		throw new Error(
			`Failed to validate space: ${toValidationErrorMessage(validateSpace().errors![0])}`,
		);
	}
	const spaceCount = 1;
	const defaultSpaces = toDefaultSpaces(community);
	const defaultSpaceCount = defaultSpaces.length;

	const unwrapEntity = async (promise: Promise<Result<{value: Entity}>>): Promise<Entity> => {
		const entity = unwrap(await promise);
		if (!validateEntity()(entity)) {
			throw new Error(
				`Failed to validate entity: ${toValidationErrorMessage(validateEntity().errors![0])}`,
			);
		}
		return entity;
	};

	const entityContent1 = 'this is entity 1';
	const entityContent2 = 'entity: 2';
	const entity1 = await unwrapEntity(
		server.db.repos.entity.create({
			actor_id: persona.persona_id,
			space_id: space.space_id,
			content: entityContent1,
		}),
	);
	const entity2 = await unwrapEntity(
		server.db.repos.entity.create({
			actor_id: persona.persona_id,
			space_id: space.space_id,
			content: entityContent2,
		}),
	);

	// do queries
	//
	//
	//

	const filterFilesValue = unwrap(await server.db.repos.entity.filterBySpace(space.space_id));
	assert.is(filterFilesValue.length, 2);
	filterFilesValue.forEach((f) => {
		if (!validateEntity()(f)) {
			throw new Error(
				`Failed to validate entity: ${toValidationErrorMessage(validateEntity().errors![0])}`,
			);
		}
	});
	assert.equal(filterFilesValue, [entity1, entity2]);

	const findSpaceValue = unwrap(await server.db.repos.space.findById(space.space_id));
	assert.equal(findSpaceValue, space);
	if (!validateSpace()(findSpaceValue)) {
		throw new Error(
			`Failed to validate space: ${toValidationErrorMessage(validateSpace().errors![0])}`,
		);
	}
	const filterSpacesValue = unwrap(
		await server.db.repos.space.filterByCommunity(community.community_id),
	);
	assert.equal(filterSpacesValue.length, spaceCount + defaultSpaceCount);
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
	assert.is(findCommunityValue.name, community.name); // TODO do a better check
	if (!validateCommunity()(findCommunityValue)) {
		throw new Error(
			`Failed to validate community: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
		);
	}
	const filterCommunitiesValue = unwrap(
		await server.db.repos.community.filterByAccount(account.account_id),
	);
	assert.equal(filterCommunitiesValue.length, 2); // TODO do a better check
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
	assert.is(filterPersonasValue.length, 1);
	assert.equal(filterPersonasValue, [persona]);
	filterPersonasValue.forEach((p) => {
		if (!validatePersona()(p)) {
			throw new Error(
				`Failed to validate persona: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
			);
		}
	});

	const findAccountByIdValue = unwrap(await server.db.repos.account.findById(account.account_id));
	assert.is(findAccountByIdValue.name, account.name); // TODO do a better check
	if (!validateAccountModel()(findAccountByIdValue)) {
		throw new Error(
			`Failed to validate account: ${toValidationErrorMessage(validateAccountModel().errors![0])}`,
		);
	}
	const findAccountByNameValue = unwrap(await server.db.repos.account.findByName(account.name));
	assert.is(findAccountByNameValue.name, account.name); // TODO do a better check
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
	// const deleteFileResult = await server.db.repos.entity.delete(
	// 	account.account_id,
	// 	space.space_id,
	// 	content,
	// );
	// assert.ok(deleteFileResult.ok);

	// TODO check to be sure the database has the same # rows in each table as when this test started --
	// maybe do this with before/after hooks so it's easily reused?
});

test__repos.run();
/* test__repos */
