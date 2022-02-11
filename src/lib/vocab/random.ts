import {unwrap} from '@feltcoop/felt';

import type {Space} from '$lib/vocab/space/space';
import type {Community} from '$lib/vocab/community/community';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community';
import type {Account, CreateAccountParams} from '$lib/vocab/account/account';
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

// TODO maybe compute in relation to `RandomVocab`
export interface RandomVocabContext {
	accounts: Account[];
	personas: Persona[];
	communities: Community[];
	spaces: Space[];
	entities: Entity[];
	account: () => Promise<Account>;
	persona: (account?: Account) => Promise<Persona>;
	community: (persona?: Persona, account?: Account) => Promise<Community>;
	space: (persona?: Persona, account?: Account, community?: Community) => Promise<Space>;
	entity: (
		persona?: Persona,
		account?: Account,
		community?: Community,
		space?: Space,
	) => Promise<Entity>;
}

/* eslint-disable no-param-reassign */

// TODO generate from schema
export const toRandomVocabContext = (db: Database): RandomVocabContext => {
	const random: RandomVocabContext = {
		accounts: [],
		personas: [],
		communities: [],
		spaces: [],
		entities: [],
		account: async () => {
			const params = randomAccountParams();
			const account = unwrap(await db.repos.account.create(params.name, params.password));
			random.accounts.push(account);
			return account;
		},
		persona: async (account) => {
			if (!account) account = await random.account();
			const {community, persona} = unwrap(
				await db.repos.persona.create(
					'account',
					randomPersonaParams().name,
					account.account_id,
					null,
				),
			);
			random.communities.push(community);
			random.personas.push(persona);
			return persona;
		},
		community: async (persona, account) => {
			if (!persona) persona = await random.persona(account);
			const params = randomCommunityParams(persona.persona_id);
			const {community} = unwrap(
				await db.repos.community.create(
					'standard',
					params.name,
					params.settings!,
					params.persona_id,
				),
			);
			random.communities.push(community);
			return community;
		},
		space: async (persona, account, community) => {
			if (!account) account = await random.account();
			if (!persona) persona = await random.persona(account);
			if (!community) community = await random.community(persona, account);
			const params = randomSpaceParams(community.community_id);
			const space = unwrap(
				await db.repos.space.create(params.name, params.view, params.url, params.community_id),
			);
			random.spaces.push(space);
			return space;
		},
		entity: async (persona, account, community, space) => {
			if (!account) account = await random.account();
			if (!persona) persona = await random.persona(account);
			if (!community) community = await random.community(persona, account);
			if (!space) space = await random.space(persona, account, community);
			const params = randomEntityParams(persona.persona_id, space.space_id);
			const entity = unwrap(
				await db.repos.entity.create(params.actor_id, params.space_id, params.data),
			);
			random.entities.push(entity);
			return entity;
		},
	};
	return random;
};
