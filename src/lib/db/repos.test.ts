import {suite} from 'uvu';
import * as assert from 'uvu/assert';
import type {Result} from '@feltcoop/felt';
import {unwrap} from '@feltcoop/felt';

import {setupDb, teardownDb, type TestDbContext} from '$lib/util/testDbHelpers';
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
import {type NoteEntityData} from '$lib/vocab/entity/entityData';

// TODO this only depends on the database --
// if we don't figure out a robust way to make a global reusable server,
// then change this module to setup and teardown only a `db` instance
// instead of the whole server

/* test__repos */
const test__repos = suite<TestDbContext>('repos');

test__repos.before(setupDb);
test__repos.after(teardownDb);

test__repos('create, change, and delete some data from repos', async ({db}) => {
	// create everything
	//
	//
	//
	const accountParams = randomAccountParams();
	const account = unwrap(await db.repos.account.create(accountParams.name, accountParams.password));

	// TODO create 2 personas
	const personaParams = randomPersonaParams();
	const {persona, community: personaHomeCommunity} = unwrap(
		await db.repos.persona.create('account', personaParams.name, account.account_id, null),
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
	const {community} = unwrap(
		await db.repos.community.create(
			'standard',
			communityParams.name,
			communityParams.settings!,
			communityParams.persona_id,
		),
	);

	const spaceParams = randomSpaceParams(community.community_id);
	const space = unwrap(
		await db.repos.space.create(
			spaceParams.name,
			spaceParams.view,
			spaceParams.url,
			spaceParams.community_id,
		),
	);
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

	const entityData1: NoteEntityData = {type: 'Note', content: 'this is entity 1'};
	const entityData2: NoteEntityData = {type: 'Note', content: 'entity: 2'};
	const entity1 = await unwrapEntity(
		db.repos.entity.create(persona.persona_id, space.space_id, entityData1),
	);
	const entity2 = await unwrapEntity(
		db.repos.entity.create(persona.persona_id, space.space_id, entityData2),
	);
	assert.is(entity1.actor_id, persona.persona_id);
	assert.is(entity2.actor_id, persona.persona_id);
	assert.is(entity1.space_id, space.space_id);
	assert.is(entity2.space_id, space.space_id);
	assert.equal(entity1.data, entityData1);
	assert.equal(entity2.data, entityData2);

	// do queries
	//
	//
	//

	const filterFilesValue = unwrap(await db.repos.entity.filterBySpace(space.space_id));
	assert.is(filterFilesValue.length, 2);
	filterFilesValue.forEach((f) => {
		if (!validateEntity()(f)) {
			throw new Error(
				`Failed to validate entity: ${toValidationErrorMessage(validateEntity().errors![0])}`,
			);
		}
	});
	assert.equal(filterFilesValue, [entity1, entity2]);

	const findSpaceValue = unwrap(await db.repos.space.findById(space.space_id));
	assert.equal(findSpaceValue, space);
	if (!validateSpace()(findSpaceValue)) {
		throw new Error(
			`Failed to validate space: ${toValidationErrorMessage(validateSpace().errors![0])}`,
		);
	}
	const filterSpacesValue = unwrap(await db.repos.space.filterByCommunity(community.community_id));
	assert.equal(filterSpacesValue.length, spaceCount + defaultSpaceCount);
	filterSpacesValue.forEach((s) => {
		if (!validateSpace()(s)) {
			throw new Error(
				`Failed to validate space: ${toValidationErrorMessage(validateSpace().errors![0])}`,
			);
		}
	});

	const findCommunityValue = unwrap(await db.repos.community.findById(community.community_id));
	assert.is(findCommunityValue.name, community.name); // TODO do a better check
	if (!validateCommunity()(findCommunityValue)) {
		throw new Error(
			`Failed to validate community: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
		);
	}
	const filterCommunitiesValue = unwrap(
		await db.repos.community.filterByAccount(account.account_id),
	);
	assert.equal(filterCommunitiesValue.length, 2); // TODO do a better check
	filterCommunitiesValue.forEach((s) => {
		if (!validateCommunity()(s)) {
			throw new Error(
				`Failed to validate community: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
			);
		}
	});

	const filterPersonasValue = unwrap(await db.repos.persona.filterByAccount(account.account_id));
	assert.is(filterPersonasValue.length, 1);
	assert.equal(filterPersonasValue, [persona]);
	filterPersonasValue.forEach((p) => {
		if (!validatePersona()(p)) {
			throw new Error(
				`Failed to validate persona: ${toValidationErrorMessage(validateCommunity().errors![0])}`,
			);
		}
	});

	const findAccountByIdValue = unwrap(await db.repos.account.findById(account.account_id));
	assert.is(findAccountByIdValue.name, account.name); // TODO do a better check
	if (!validateAccountModel()(findAccountByIdValue)) {
		throw new Error(
			`Failed to validate account: ${toValidationErrorMessage(validateAccountModel().errors![0])}`,
		);
	}
	const findAccountByNameValue = unwrap(await db.repos.account.findByName(account.name));
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

	// TODO implement for entities
	// const deleteFileResult = await db.repos.entity.delete(
	// 	account.account_id,
	// 	space.space_id,
	// 	content,
	// );
	// assert.ok(deleteFileResult.ok);

	for (const space of filterSpacesValue) {
		const result = await db.repos.space.deleteById(space.space_id);
		assert.ok(result.ok);
	}
	const deletedSpaceResult = await db.repos.space.filterByCommunity(community.community_id);
	assert.is(unwrap(deletedSpaceResult).length, 0);

	assert.is(
		unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
		2,
	);
	const deletedMembershipResult = await db.repos.membership.deleteById(
		persona.persona_id,
		community.community_id,
	);
	assert.ok(deletedMembershipResult.ok);
	assert.is(
		unwrap(await db.repos.membership.filterByCommunityId(community.community_id)).length,
		1,
	);

	// TODO delete communities here

	// TODO delete personas here

	// TODO delete accounts here

	// TODO check to be sure the database has the same # rows in each table as when this test started --
	// maybe do this with before/after hooks so it's easily reused?
});

test__repos.run();
/* test__repos */
