import {unwrap} from '@feltcoop/felt';

import type {Space} from '$lib/vocab/space/space';
import type {Community} from '$lib/vocab/community/community';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import type {Account} from '$lib/vocab/account/account';
import type {CreateAccountParams} from '$lib/vocab/account/account.schema';
import type {Persona} from '$lib/vocab/persona/persona';
import type {
	CreateCommunityParams,
	CreateAccountPersonaParams,
	CreateEntityParams,
	CreateSpaceParams,
	CreateMembershipParams,
	CreateTieParams,
} from '$lib/app/eventTypes';
import type {Database} from '$lib/db/Database';
import type {EntityData} from '$lib/vocab/entity/entityData';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Tie} from '$lib/vocab/tie/tie';
import {CreateAccountPersonaService} from '$lib/vocab/persona/personaServices';
import {SessionApiMock} from '$lib/session/SessionApiMock';
import {CreateCommunityService} from '$lib/vocab/community/communityServices';
import {CreateSpaceService} from '$lib/vocab/space/spaceServices';
import type {Membership} from '$lib/vocab/membership/membership';
import {CreateEntityService} from '$lib/vocab/entity/entityServices';
import {CreateTieService} from '$lib/vocab/tie/tieServices';

const session = new SessionApiMock();

// TODO automate these from schemas, also use seeded rng
export const randomString = (): string => Math.random().toString().slice(2);
export const randomAccountName = randomString;
export const randomPassword = randomString;
export const randomPersonaName = randomString;
export const randomCommunnityName = randomString;
export const randomSpaceUrl = randomString;
export const randomSpaceIcon = (): string => '🥥';
export const randomSpaceName = randomString;
export const randomView = (): string => '<Room />';
export const randomEntityData = (): EntityData => ({type: 'Note', content: randomString()});
export const randomTieType = randomString;
export const randomAccountParams = (): CreateAccountParams => ({
	name: randomAccountName(),
	password: randomPassword(),
});
export const randomPersonaParams = (): CreateAccountPersonaParams => ({
	name: randomPersonaName(),
});
export const randomMembershipParams = (
	persona_id: number,
	community_id: number,
): CreateMembershipParams => ({
	persona_id,
	community_id,
});
export const randomCommunityParams = (persona_id: number): CreateCommunityParams => {
	const name = randomCommunnityName();
	return {
		name,
		persona_id,
		settings: toDefaultCommunitySettings(name),
	};
};
export const randomSpaceParams = (persona_id: number, community_id: number): CreateSpaceParams => ({
	persona_id,
	community_id,
	view: randomView(),
	name: randomSpaceName(),
	url: randomSpaceUrl(),
	icon: randomSpaceIcon(),
});
export const randomEntityParams = (actor_id: number, source_id: number): CreateEntityParams => ({
	actor_id,
	data: randomEntityData(),
	source_id,
});
export const randomTieParams = (source_id: number, dest_id: number): CreateTieParams => ({
	source_id,
	dest_id,
	type: randomTieType(),
});

// TODO maybe compute in relation to `RandomVocabContext`
export interface RandomVocab {
	account?: Account;
	persona?: Persona;
	community?: Community;
	space?: Space;
	entity?: Entity;
}

/* eslint-disable no-param-reassign */

// TODO generate from schema
// TODO replace db.repos calls w/ service calls (see persona/community creation)
export class RandomVocabContext {
	constructor(private db: Database) {}

	async account(): Promise<Account> {
		const params = randomAccountParams();
		const account = unwrap(await this.db.repos.account.create(params.name, params.password));
		return account;
	}

	async persona(account?: Account): Promise<{
		persona: Persona;
		personalCommunity: Community;
		membership: Membership;
		spaces: Space[];
		account: Account;
	}> {
		if (!account) account = await this.account();
		const {
			persona,
			community: personalCommunity,
			membership,
			spaces,
		} = unwrap(
			await CreateAccountPersonaService.perform({
				params: {name: randomPersonaParams().name},
				account_id: account.account_id,
				repos: this.db.repos,
				session,
			}),
		);
		return {persona, personalCommunity, membership, spaces, account};
	}

	async community(
		persona?: Persona,
		account?: Account,
	): Promise<{
		community: Community;
		communityPersona: Persona;
		memberships: Membership[];
		spaces: Space[];
		persona: Persona;
		account: Account;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona, account} = await this.persona(account));
		const params = randomCommunityParams(persona.persona_id);
		const {community, communityPersona, memberships, spaces} = unwrap(
			await CreateCommunityService.perform({
				params,
				account_id: account.account_id,
				repos: this.db.repos,
				session,
			}),
		);
		return {community, communityPersona, memberships, spaces, persona, account};
	}

	async space(
		persona?: Persona,
		account?: Account,
		community?: Community,
	): Promise<{space: Space; persona: Persona; account: Account; community: Community}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!community) ({community} = await this.community(persona, account));
		const params = randomSpaceParams(persona.persona_id, community.community_id);
		const {space} = unwrap(
			await CreateSpaceService.perform({
				params,
				account_id: account.account_id,
				repos: this.db.repos,
				session,
			}),
		);
		return {space, persona, account, community};
	}

	//TODO do we need space now? Should be source_id
	async entity(
		persona?: Persona,
		account?: Account,
		community?: Community,
		space?: Space,
		paramsPartial?: Partial<CreateEntityParams>,
	): Promise<{
		entity: Entity;
		persona: Persona;
		account: Account;
		community: Community;
		space: Space;
		tie: Tie;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!community) ({community} = await this.community(persona, account));
		if (!space) ({space} = await this.space(persona, account, community));
		const {entity, tie} = unwrap(
			await CreateEntityService.perform({
				params: {
					...randomEntityParams(persona.persona_id, space.directory_id),
					...paramsPartial,
				},
				account_id: account.account_id,
				repos: this.db.repos,
				session,
			}),
		);
		return {entity, persona, account, community, space, tie};
	}

	async tie(
		sourceEntity?: Entity,
		destEntity?: Entity,
		persona?: Persona,
		account?: Account,
		community?: Community,
		space?: Space,
		type?: Tie['type'],
	): Promise<{
		tie: Tie;
		sourceEntity: Entity;
		destEntity: Entity;
		persona: Persona;
		account: Account;
		community: Community;
		space: Space;
	}> {
		if (!account) account = await this.account();
		if (!persona) ({persona} = await this.persona(account));
		if (!community) ({community} = await this.community(persona, account));
		if (!space) ({space} = await this.space(persona, account, community));
		if (!sourceEntity)
			({entity: sourceEntity} = await this.entity(persona, account, community, space));
		if (!destEntity) ({entity: destEntity} = await this.entity(persona, account, community, space));
		const params = randomTieParams(sourceEntity.entity_id, destEntity.entity_id);
		if (type) params.type = type;
		const {tie} = unwrap(
			await CreateTieService.perform({
				params,
				account_id: account.account_id,
				repos: this.db.repos,
				session,
			}),
		);
		return {tie, sourceEntity, destEntity, persona, account, community, space};
	}
}
