import {unwrap} from '@feltcoop/felt';

import type {Space, SpaceParams} from '$lib/vocab/space/space';
import type {Community, CommunityParams} from '$lib/vocab/community/community';
import type {Account, AccountParams} from '$lib/vocab/account/account';
import type {Persona, PersonaParams} from '$lib/vocab/persona/persona';
import type {FileParams} from '$lib/vocab/file/file';
import type {Database} from '$lib/db/Database';
import type {MemberParams} from '$lib/vocab/member/member';

// TODO automate these from schemas, also use seeded rng
export const randomString = () => Math.random().toString().slice(2);
export const randomAccountName = randomString;
export const randomPassword = randomString;
export const randomPersonaName = randomString;
export const randomCommunnityName = randomString;
export const randomSpaceUrl = randomString;
export const randomSpaceName = randomString;
export const randomContent = randomString;
export const randomAccountParams = (): AccountParams => ({
	name: randomAccountName(),
	password: randomPassword(),
});
export const randomPersonaParams = (account_id: number): PersonaParams => ({
	name: randomPersonaName(),
	account_id,
});
export const randomMemberParams = (persona_id: number, community_id: number): MemberParams => ({
	persona_id,
	community_id,
});
export const randomCommunityParams = (persona_id: number): CommunityParams => ({
	name: randomCommunnityName(),
	persona_id,
});
export const randomSpaceParams = (community_id: number): SpaceParams => ({
	community_id,
	content: randomContent(),
	media_type: 'text/plain',
	name: randomSpaceName(),
	url: randomSpaceUrl(),
});
export const randomFileParams = (actor_id: number, space_id: number): FileParams => ({
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
	account: () => Promise<Account>;
	persona: (account?: Account) => Promise<Persona>;
	community: (persona?: Persona, account?: Account) => Promise<Community>;
	space: (persona?: Persona, account?: Account, community?: Community) => Promise<Space>;
}

// TODO generate from schema
export const toRandomVocabContext = (db: Database): RandomVocabContext => {
	const random: RandomVocabContext = {
		account: async () => {
			return unwrap(await db.repos.account.create(randomAccountParams()));
		},
		persona: async (account) => {
			if (!account) account = await random.account();
			return unwrap(await db.repos.persona.create(randomPersonaParams(account.account_id))).persona;
		},
		community: async (persona, account) => {
			if (!persona) persona = await random.persona(account);
			return unwrap(await db.repos.community.create(randomCommunityParams(persona.persona_id)));
		},
		space: async (persona, account, community) => {
			if (!account) account = await random.account();
			if (!persona) persona = await random.persona(account);
			if (!community) community = await random.community(persona, account);
			return unwrap(await db.repos.space.create(randomSpaceParams(community.community_id)));
		},
	};
	return random;
};
