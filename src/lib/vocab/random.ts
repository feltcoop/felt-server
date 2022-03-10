import {unwrap} from '@feltcoop/felt';

import type {Space} from '$lib/vocab/space/space';
import type {Community} from '$lib/vocab/community/community';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import type {Account} from '$lib/vocab/account/account';
import type {CreateAccountParams} from '$lib/vocab/account/account.schema';
import type {Persona} from '$lib/vocab/persona/persona';
import type {
	CreateCommunityParams,
	CreatePersonaParams,
	CreateEntityParams,
	CreateSpaceParams,
	CreateMembershipParams,
} from '$lib/app/eventTypes';
import type {Database} from '$lib/db/Database';
import type {EntityData} from '$lib/vocab/entity/entityData';
import type {ViewData} from '$lib/vocab/view/view';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Tie} from '$lib/vocab/tie/tie';

// TODO automate these from schemas, also use seeded rng
export const randomString = (): string => Math.random().toString().slice(2);
export const randomAccountName = randomString;
export const randomPassword = randomString;
export const randomPersonaName = randomString;
export const randomCommunnityName = randomString;
export const randomSpaceUrl = randomString;
export const randomSpaceName = randomString;
export const randomViewData = (): ViewData => ({type: 'Room', props: {data: '/entities'}});
export const randomEntityData = (): EntityData => ({type: 'Note', content: randomString()});
export const randomAccountParams = (): CreateAccountParams => ({
	name: randomAccountName(),
	password: randomPassword(),
});
export const randomPersonaParams = (): CreatePersonaParams => ({
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
export const randomSpaceParams = (community_id: number): CreateSpaceParams => ({
	community_id,
	view: randomViewData(),
	name: randomSpaceName(),
	url: randomSpaceUrl(),
});
export const randomEntityParams = (actor_id: number, space_id: number): CreateEntityParams => ({
	actor_id,
	space_id,
	data: randomEntityData(),
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
export class RandomVocabContext {
	constructor(private db: Database) {}

	accounts: Account[] = [];
	personas: Persona[] = [];
	communities: Community[] = [];
	spaces: Space[] = [];
	entities: Entity[] = [];
	ties: Tie[] = [];

	async account(): Promise<Account> {
		const params = randomAccountParams();
		const account = unwrap(await this.db.repos.account.create(params.name, params.password));
		this.accounts.push(account);
		return account;
	}

	async persona(account?: Account): Promise<Persona> {
		if (!account) account = await this.account();
		const {community, persona} = unwrap(
			await this.db.repos.persona.create(
				'account',
				randomPersonaParams().name,
				account.account_id,
				null,
			),
		);
		this.communities.push(community);
		this.personas.push(persona);
		return persona;
	}

	async community(persona?: Persona, account?: Account): Promise<Community> {
		if (!persona) persona = await this.persona(account);
		const params = randomCommunityParams(persona.persona_id);
		const {community} = unwrap(
			await this.db.repos.community.create(
				'standard',
				params.name,
				params.settings!,
				params.persona_id,
			),
		);
		this.communities.push(community);
		return community;
	}

	async space(persona?: Persona, account?: Account, community?: Community): Promise<Space> {
		if (!account) account = await this.account();
		if (!persona) persona = await this.persona(account);
		if (!community) community = await this.community(persona, account);
		const params = randomSpaceParams(community.community_id);
		const space = unwrap(
			await this.db.repos.space.create(params.name, params.view, params.url, params.community_id),
		);
		this.spaces.push(space);
		return space;
	}

	async entity(
		persona?: Persona,
		account?: Account,
		community?: Community,
		space?: Space,
	): Promise<Entity> {
		if (!account) account = await this.account();
		if (!persona) persona = await this.persona(account);
		if (!community) community = await this.community(persona, account);
		if (!space) space = await this.space(persona, account, community);
		const params = randomEntityParams(persona.persona_id, space.space_id);
		const entity = unwrap(
			await this.db.repos.entity.create(params.actor_id, params.space_id, params.data),
		);
		this.entities.push(entity);
		return entity;
	}

	async tie(sourceEntity?: Entity, destEntity?: Entity): Promise<Tie> {
		if (!sourceEntity) sourceEntity = await this.entity();
		if (!destEntity) destEntity = await this.entity();
		const tie = unwrap(
			await this.db.repos.tie.create(sourceEntity.entity_id, destEntity.entity_id, 'HasItem'),
		);
		this.ties.push(tie);
		return tie;
	}
}
