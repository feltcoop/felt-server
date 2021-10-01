import {randomBool, randomItem} from '@feltcoop/felt/util/random.js';

import type {EventInfo} from '$lib/vocab/event/event';
import {
	randomFileParams,
	randomMembershipParams,
	randomString,
	RandomVocab,
	RandomVocabContext,
} from '$lib/vocab/random';
import {randomPersonaParams, randomCommunityParams, randomSpaceParams} from '$lib/vocab/random';

// TODO type should return the params associated with the event name
// TODO maybe move to `src/lib/util`
// TODO keep factoring this until it's fully automated, generating from the schema
export const randomEventParams = async (
	event: EventInfo,
	random: RandomVocabContext,
	{account, persona, community, space}: RandomVocab,
): Promise<any> => {
	switch (event.name) {
		case 'log_in': {
			return {
				accountName: randomString(),
				password: randomString(),
			};
		}
		case 'log_out': {
			return undefined;
		}
		case 'create_community': {
			if (!persona) persona = await random.persona(account);
			return randomCommunityParams(persona.persona_id);
		}
		case 'read_community': {
			if (!community) community = await random.community(persona, account);
			return {community_id: community.community_id};
		}
		case 'read_communities': {
			return {};
		}
		case 'create_persona': {
			return randomPersonaParams();
		}
		case 'create_membership': {
			if (!persona) persona = await random.persona(account);
			if (!community) community = await random.community(); // don't forward `persona`/`account` bc that's the service's job
			return randomMembershipParams(persona.persona_id, community.community_id);
		}
		case 'create_space': {
			if (!community) community = await random.community(persona, account);
			return randomSpaceParams(community.community_id);
		}
		case 'read_space': {
			if (!space) space = await random.space(persona, account, community);
			return {space_id: space.space_id};
		}
		case 'read_spaces': {
			if (!community) community = await random.community(persona, account);
			return {community_id: community.community_id};
		}
		case 'create_file': {
			if (!persona) persona = await random.persona(account);
			if (!space) space = await random.space(persona, account, community);
			return randomFileParams(persona.persona_id, space.space_id);
		}
		case 'read_files': {
			if (!space) space = await random.space(persona, account, community);
			return {space_id: space.space_id};
		}
		case 'query_files': {
			return {space_id: (await random.space(persona, account, community)).space_id};
		}
		// TODO instead of randomizing, use existing ones from the arrays?
		// what's the best way to do that?
		case 'toggle_main_nav': {
			return undefined;
		}
		case 'toggle_secondary_nav': {
			return undefined;
		}
		case 'set_main_nav_view': {
			return randomItem(['explorer', 'account']);
		}
		case 'set_mobile': {
			return randomBool();
		}
		case 'select_persona': {
			return {persona_id: (await random.persona(account)).persona_id};
		}
		case 'select_community': {
			return {
				// TODO refactor
				community_id: await randomItem([
					async () => (await random.community(persona, account)).community_id,
					() => null,
				])(),
			};
		}
		case 'select_space': {
			return {
				community_id: (await random.community(persona, account)).community_id,
				space_id: (await random.space(persona, account, community)).space_id,
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
