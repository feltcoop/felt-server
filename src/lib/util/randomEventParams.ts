import {randomBool} from '@feltcoop/felt/util/random.js';
import {writable} from 'svelte/store';

import {
	randomEntityData,
	randomEntityParams,
	randomMembershipParams,
	randomString,
	randomPersonaParams,
	randomSpaceParams,
	randomSpaceName,
	randomCommunityParams,
} from '$lib/util/randomVocab';
import {randomHue} from '$lib/ui/color';
import type {RandomEventParams} from '$lib/util/randomEventParamsTypes';

/* eslint-disable no-param-reassign */

export const randomEventParams: RandomEventParams = {
	Ping: async () => {
		return undefined;
	},
	LoginAccount: async () => {
		return {
			username: randomString(),
			password: randomString(),
		};
	},
	LogoutAccount: async () => {
		return undefined;
	},
	CreateCommunity: async (random, {account, persona} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		return randomCommunityParams(persona.persona_id);
	},
	UpdateCommunitySettings: async (random, {account, persona, community} = {}) => {
		if (!community) ({community} = await random.community(persona, account));
		return {community_id: community.community_id, settings: {hue: randomHue()}};
	},
	ReadCommunity: async (random, {account, persona, community} = {}) => {
		if (!community) ({community} = await random.community(persona, account));
		return {community_id: community.community_id};
	},
	DeleteCommunity: async (random, {account, persona, community} = {}) => {
		if (!community) ({community} = await random.community(persona, account));
		return {community_id: community.community_id};
	},
	ReadCommunities: async () => {
		return {};
	},
	CreateAccountPersona: async () => {
		return randomPersonaParams();
	},
	ReadPersona: async (random, {persona} = {}) => {
		if (!persona) ({persona} = await random.persona());
		return {persona_id: persona.persona_id};
	},
	CreateMembership: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community()); // don't forward `persona`/`account` bc that's the service's job
		return randomMembershipParams(persona.persona_id, community.community_id);
	},
	DeleteMembership: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community(persona));
		return {persona_id: persona.persona_id, community_id: community.community_id};
	},
	CreateSpace: async (random, {account, persona, community} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!community) ({community} = await random.community(persona, account));
		return randomSpaceParams(persona.persona_id, community.community_id);
	},
	UpdateSpace: async (random, {account, persona, community, space} = {}) => {
		if (!space) ({space} = await random.space(persona, account, community));
		return {space_id: space.space_id, name: randomSpaceName()};
	},
	DeleteSpace: async (random, {account, persona, community, space} = {}) => {
		if (!space) ({space} = await random.space(persona, account, community));
		return {space_id: space.space_id};
	},
	ReadSpace: async (random, {account, persona, community, space} = {}) => {
		if (!space) ({space} = await random.space(persona, account, community));
		return {space_id: space.space_id};
	},
	ReadSpaces: async (random, {account, persona, community} = {}) => {
		if (!community) ({community} = await random.community(persona, account));
		return {community_id: community.community_id};
	},
	CreateEntity: async (random, {account, persona, community, space} = {}) => {
		if (!persona) ({persona} = await random.persona(account));
		if (!space) ({space} = await random.space(persona, account, community));
		return randomEntityParams(persona.persona_id, space.space_id, space.directory_id);
	},
	ReadEntities: async (random, {account, persona, community, space} = {}) => {
		if (!space) ({space} = await random.space(persona, account, community));
		return {space_id: space.space_id};
	},
	ReadEntitiesPaginated: async (random, {account, persona, community, space} = {}) => {
		if (!space) ({space} = await random.space(persona, account, community));
		return {source_id: space.directory_id};
	},
	QueryEntities: async (random, {account, persona, community} = {}) => {
		return {
			space_id: (await random.space(persona, account, community)).space.space_id,
		};
	},
	UpdateEntity: async (random, {account, persona, community, space} = {}) => {
		return {
			entity_id: (await random.entity(persona, account, community, space)).entity.entity_id,
			data: randomEntityData(),
		};
	},
	EraseEntity: async (random, {account, persona, community, space} = {}) => {
		return {
			entity_id: (await random.entity(persona, account, community, space)).entity.entity_id,
		};
	},
	DeleteEntities: async (random, {account, persona, community, space} = {}) => {
		const entity1 = await random.entity(persona, account, community, space);
		const entity2 = await random.entity(persona, account, community, space);
		return {
			entity_ids: [entity1.entity.entity_id, entity2.entity.entity_id],
		};
	},
	CreateTie: async (random, {account, persona, community, space} = {}) => {
		return {
			source_id: (await random.entity(persona, account, community, space)).entity.entity_id,
			dest_id: (await random.entity(persona, account, community, space)).entity.entity_id,
			type: 'HasReply',
		};
	},
	ReadTies: async (random, {account, persona, community, space} = {}) => {
		if (!space) ({space} = await random.space(persona, account, community));
		return {space_id: space.space_id};
	},
	DeleteTie: async (random, {account, persona, community, space} = {}) => {
		const {tie} = await random.tie(undefined, undefined, persona, account, community, space);
		return {
			source_id: tie.source_id,
			dest_id: tie.dest_id,
			type: tie.type,
		};
	},
	ToggleMainNav: async () => {
		return undefined;
	},
	ToggleSecondaryNav: async () => {
		return undefined;
	},
	SetMobile: async () => {
		return randomBool();
	},
	OpenDialog: async () => {
		// TODO should use the `instanceof` `ajv-keywords` extension for this:
		// https://github.com/ajv-validator/ajv-keywords#instanceof
		// using the single keyword directly:
		// `require("ajv-keywords/dist/keywords/instanceof")(ajv, opts)`
		// and this value should be:
		// `class SomeComponent extends SvelteComponent {}`
		return {Component: {} as any};
	},
	CloseDialog: async () => {
		return undefined;
	},
	SelectPersona: async (random, {account} = {}) => {
		return {
			persona_id: (await random.persona(account)).persona.persona_id,
		};
	},
	SelectCommunity: async (random, {account, persona} = {}) => {
		return {
			community_id: (await random.community(persona, account)).community.community_id,
		};
	},
	SelectSpace: async (random, {account, persona, community} = {}) => {
		return {
			community_id: (await random.community(persona, account)).community.community_id,
			space_id: (await random.space(persona, account, community)).space.space_id,
		};
	},
	ViewSpace: async (random, {account, persona, community} = {}) => {
		return {
			space: writable(await random.space(persona, account, community)) as any,
			view: '<EntityExplorer />',
		};
	},
};
