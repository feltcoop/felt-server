import {randomBool} from '@feltcoop/felt/util/random.js';
import {writable} from 'svelte/store';

import type {EventInfo} from '$lib/vocab/event/event';
import {
	randomEntityData,
	randomEntityParams,
	randomMembershipParams,
	randomString,
	type RandomVocab,
	type RandomVocabContext,
	randomPersonaParams,
	randomCommunityParams,
	randomSpaceParams,
	randomSpaceName,
} from '$lib/vocab/random';
import {randomHue} from '$lib/ui/color';

/* eslint-disable no-param-reassign */

// TODO consider the pattern below where every `create` event creates all dependencies from scratch.
// We may want to instead test things for both new and existing objects.
// TODO refactor to make it more ergnomic to read from the cache
// TODO type should return the params associated with the event name
// TODO maybe move to `src/lib/util`
// TODO keep factoring this until it's fully automated, generating from the schema
export const randomEventParams = async (
	event: EventInfo,
	random: RandomVocabContext,
	{account, persona, community, space}: RandomVocab = {},
): Promise<any> => {
	switch (event.name) {
		case 'Ping': {
			return null;
		}
		case 'LoginAccount': {
			return {
				username: randomString(),
				password: randomString(),
			};
		}
		case 'LogoutAccount': {
			return null;
		}
		case 'CreateCommunity': {
			if (!persona) ({persona} = await random.persona(account));
			return randomCommunityParams(persona.persona_id);
		}
		case 'UpdateCommunitySettings': {
			if (!community) ({community} = await random.community(persona, account));
			return {community_id: community.community_id, settings: {hue: randomHue()}};
		}
		case 'ReadCommunity': {
			if (!community) ({community} = await random.community(persona, account));
			return {community_id: community.community_id};
		}
		case 'DeleteCommunity': {
			do {
				// eslint-disable-next-line no-await-in-loop
				({community} = await random.community(persona, account));
			} while (community.type !== 'standard');
			return {community_id: community.community_id};
		}
		case 'ReadCommunities': {
			return {};
		}
		case 'CreateAccountPersona': {
			return randomPersonaParams();
		}
		case 'ReadPersona': {
			if (!persona) ({persona} = await random.persona());
			return {persona_id: persona.persona_id};
		}
		case 'CreateMembership': {
			if (!persona) ({persona} = await random.persona(account));
			if (!community) ({community} = await random.community()); // don't forward `persona`/`account` bc that's the service's job
			return randomMembershipParams(persona.persona_id, community.community_id);
		}
		case 'DeleteMembership': {
			if (!persona) ({persona} = await random.persona(account));
			if (!community) ({community} = await random.community(persona));
			return {persona_id: persona.persona_id, community_id: community.community_id};
		}
		case 'CreateSpace': {
			if (!community) ({community} = await random.community(persona, account));
			return randomSpaceParams(community.community_id);
		}
		case 'UpdateSpace': {
			if (!space) ({space} = await random.space(persona, account, community));
			return {space_id: space.space_id, name: randomSpaceName()};
		}
		case 'DeleteSpace': {
			if (!space) ({space} = await random.space(persona, account, community));
			return {space_id: space.space_id};
		}
		case 'ReadSpace': {
			if (!space) ({space} = await random.space(persona, account, community));
			return {space_id: space.space_id};
		}
		case 'ReadSpaces': {
			if (!community) ({community} = await random.community(persona, account));
			return {community_id: community.community_id};
		}
		case 'CreateEntity': {
			if (!persona) ({persona} = await random.persona(account));
			if (!space) ({space} = await random.space(persona, account, community));
			return randomEntityParams(persona.persona_id, space.space_id, space.directory_id);
		}
		case 'ReadEntities': {
			if (!space) ({space} = await random.space(persona, account, community));
			return {space_id: space.space_id};
		}
		case 'QueryEntities': {
			return {
				space_id: (await random.space(persona, account, community)).space.space_id,
			};
		}
		case 'UpdateEntity': {
			return {
				entity_id: (await random.entity(persona, account, community, space)).entity.entity_id,
				data: randomEntityData(),
			};
		}
		case 'EraseEntity': {
			return {
				entity_id: (await random.entity(persona, account, community, space)).entity.entity_id,
			};
		}
		case 'DeleteEntities': {
			const entity1 = await random.entity(persona, account, community, space);
			const entity2 = await random.entity(persona, account, community, space);
			return {
				entity_ids: [entity1.entity.entity_id, entity2.entity.entity_id],
			};
		}
		case 'CreateTie': {
			return {
				source_id: (await random.entity(persona, account, community, space)).entity.entity_id,
				dest_id: (await random.entity(persona, account, community, space)).entity.entity_id,
				type: 'HasReply',
			};
		}
		case 'ReadTies': {
			if (!space) {
				({space} = await random.space(persona, account, community));
			}
			return {space_id: space.space_id};
		}
		case 'DeleteTie': {
			const {tie} = await random.tie(undefined, undefined, persona, account, community, space);
			return {
				source_id: tie.source_id,
				dest_id: tie.dest_id,
				type: tie.type,
			};
		}
		// TODO instead of randomizing, use existing ones from the arrays?
		// what's the best way to do that?
		case 'ToggleMainNav': {
			return undefined;
		}
		case 'ToggleSecondaryNav': {
			return undefined;
		}
		case 'SetMobile': {
			return randomBool();
		}
		case 'OpenDialog': {
			// TODO should use the `instanceof` `ajv-keywords` extension for this:
			// https://github.com/ajv-validator/ajv-keywords#instanceof
			// using the single keyword directly:
			// `require("ajv-keywords/dist/keywords/instanceof")(ajv, opts)`
			// and this value should be:
			// `class SomeComponent extends SvelteComponent {}`
			return {Component: {}};
		}
		case 'CloseDialog': {
			return undefined;
		}
		case 'SelectPersona': {
			return {
				persona_id: (await random.persona(account)).persona.persona_id,
			};
		}
		case 'SelectCommunity': {
			return {
				community_id: (await random.community(persona, account)).community.community_id,
			};
		}
		case 'SelectSpace': {
			return {
				community_id: (await random.community(persona, account)).community.community_id,
				space_id: (await random.space(persona, account, community)).space.space_id,
			};
		}
		case 'ViewSpace': {
			return {
				space: writable(await random.space(persona, account, community)),
				view: {type: 'EntityExplorer'},
			};
		}
		// TODO could do an exhaustive typecheck (so it'll be caught by TS, not at runtime)
		// by generating something like a type union of `EventInfo`s and
		// replacing the generic service type in the above function signature
		default: {
			throw Error(`Unhandled service for randomEventParams: ${event.name}`);
		}
	}
};
