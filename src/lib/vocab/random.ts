import {unwrap} from '@feltcoop/felt';

import type {Space} from '$lib/vocab/space/space';
import type {Community} from '$lib/vocab/community/community';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community';
import type {Account, CreateAccountParams} from '$lib/vocab/account/account';
import type {Persona} from '$lib/vocab/persona/persona';
import type {
	CreateCommunityParams,
	CreatePersonaParams,
	CreateFileParams,
	CreateSpaceParams,
	CreateMembershipParams,
} from '$lib/app/eventTypes';
import type {Database} from '$lib/db/Database';

// TODO automate these from schemas, also use seeded rng
export const randomString = () => Math.random().toString().slice(2);
export const randomAccountName = randomString;
export const randomPassword = randomString;
export const randomPersonaName = randomString;
export const randomCommunnityName = randomString;
export const randomSpaceUrl = randomString;
export const randomSpaceName = randomString;
export const randomContent = randomString;
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
	content: randomContent(),
	media_type: 'text/plain',
	name: randomSpaceName(),
	url: randomSpaceUrl(),
});
export const randomFileParams = (actor_id: number, space_id: number): CreateFileParams => ({
	actor_id,
	space_id,
	content: randomContent(),
});

// TODO maybe compute in relation to `RandomVocabContext`
export interface RandomVocab {
	account?: Account;
	persona?: Persona;
	community?: Community;
	space?: Space;
}

// TODO maybe compute in relation to `RandomVocab`
export interface RandomVocabContext {
	accounts: Account[];
	personas: Persona[];
	communities: Community[];
	spaces: Space[];
	account: () => Promise<Account>;
	persona: (account?: Account) => Promise<Persona>;
	community: (persona?: Persona, account?: Account) => Promise<Community>;
	space: (persona?: Persona, account?: Account, community?: Community) => Promise<Space>;
}

// TODO generate from schema
export const toRandomVocabContext = (db: Database): RandomVocabContext => {
	const random: RandomVocabContext = {
		accounts: [],
		personas: [],
		communities: [],
		spaces: [],
		account: async () => {
			const account = unwrap(await db.repos.account.create(randomAccountParams()));
			random.accounts.push(account);
			return account;
		},
		persona: async (account) => {
			if (!account) account = await random.account();
			const {community, persona} = unwrap(
				await db.repos.persona.create(randomPersonaParams().name, account.account_id),
			);
			random.communities.push(community);
			random.personas.push(persona);
			return persona;
		},
		community: async (persona, account) => {
			if (!persona) persona = await random.persona(account);
			const params = randomCommunityParams(persona.persona_id);
			const community = unwrap(
				await db.repos.community.create(params.name, params.persona_id, params.settings!),
			);
			random.communities.push(community);
			return community;
		},
		space: async (persona, account, community) => {
			if (!account) account = await random.account();
			if (!persona) persona = await random.persona(account);
			if (!community) community = await random.community(persona, account);
			const space = unwrap(await db.repos.space.create(randomSpaceParams(community.community_id)));
			random.spaces.push(space);
			return space;
		},
	};
	return random;
};
