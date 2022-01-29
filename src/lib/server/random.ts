import {randomBool, randomItem} from '@feltcoop/felt/util/random.js';
import {writable} from 'svelte/store';

import type {EventInfo} from '$lib/vocab/event/event';
import {
	randomEntityParams,
	randomMembershipParams,
	randomString,
	type RandomVocab,
	type RandomVocabContext,
} from '$lib/vocab/random';
import {randomPersonaParams, randomCommunityParams, randomSpaceParams} from '$lib/vocab/random';
import {randomHue} from '$lib/ui/color';
import ManageMembershipForm from '$lib/ui/ManageMembershipForm.svelte';

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
		case 'LogIn': {
			return {
				accountName: randomString(),
				password: randomString(),
			};
		}
		case 'LogOut': {
			return null;
		}
		case 'CreateCommunity': {
			if (!persona) persona = await random.persona(account);
			return randomCommunityParams(persona.persona_id);
		}
		case 'UpdateCommunitySettings': {
			if (!persona) persona = await random.persona(account);
			if (!community) community = await random.community(persona);
			return {community_id: community.community_id, settings: {hue: randomHue()}};
		}
		case 'ReadCommunity': {
			if (!community) {
				community = randomItem(random.communities) || (await random.community(persona, account));
			}
			return {community_id: community.community_id};
		}
		case 'ReadCommunities': {
			return {};
		}
		case 'CreatePersona': {
			return randomPersonaParams();
		}
		case 'CreateMembership': {
			if (!persona) persona = await random.persona(account);
			if (!community) community = await random.community(); // don't forward `persona`/`account` bc that's the service's job
			return randomMembershipParams(persona.persona_id, community.community_id);
		}
		case 'DeleteMembership': {
			if (!persona) persona = await random.persona(account);
			if (!community) community = await random.community(persona); // don't forward `persona`/`account` bc that's the service's job
			return {persona_id: persona.persona_id, community_id: community.community_id};
		}
		case 'CreateSpace': {
			if (!community) community = await random.community(persona, account);
			return randomSpaceParams(community.community_id);
		}
		case 'DeleteSpace': {
			if (!space) space = await random.space(persona, account, community);
			return {space_id: space.space_id};
		}
		case 'ReadSpace': {
			if (!space) {
				space = randomItem(random.spaces) || (await random.space(persona, account, community));
			}
			return {space_id: space.space_id};
		}
		case 'ReadSpaces': {
			if (!community) {
				community = randomItem(random.communities) || (await random.community(persona, account));
			}
			return {community_id: community.community_id};
		}
		case 'CreateEntity': {
			if (!persona) persona = await random.persona(account);
			if (!space) space = await random.space(persona, account, community);
			return randomEntityParams(persona.persona_id, space.space_id);
		}
		case 'ReadEntities': {
			if (!space) {
				space = randomItem(random.spaces) || (await random.space(persona, account, community));
			}
			return {space_id: space.space_id};
		}
		case 'QueryEntities': {
			return {
				space_id: (randomItem(random.spaces) || (await random.space(persona, account, community)))
					.space_id,
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
			return {Component: ManageMembershipForm};
		}
		case 'CloseDialog': {
			return undefined;
		}
		case 'SelectPersona': {
			return {
				persona_id: (randomItem(random.personas) || (await random.persona(account))).persona_id,
			};
		}
		case 'SelectCommunity': {
			return {
				// TODO refactor
				community_id: await randomItem([
					async () =>
						(randomItem(random.communities) || (await random.community(persona, account)))
							.community_id,
					() => null,
				])(),
			};
		}
		case 'SelectSpace': {
			return {
				community_id: (randomItem(random.communities) || (await random.community(persona, account)))
					.community_id,
				space_id: (randomItem(random.spaces) || (await random.space(persona, account, community)))
					.space_id,
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
