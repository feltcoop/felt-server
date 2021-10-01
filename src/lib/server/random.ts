import type {EventInfo} from '$lib/vocab/event/event';
import {
	randomFileParams,
	randomMembershipParams,
	RandomVocab,
	RandomVocabContext,
} from '$lib/vocab/random';
import {randomPersonaParams, randomCommunityParams, randomSpaceParams} from '$lib/vocab/random';

// TODO maybe move to `src/lib/util`
// TODO keep factoring this until it's fully automated, generating from the schema
export const randomEventParams = async (
	event: EventInfo,
	random: RandomVocabContext,
	{account, persona, community, space}: RandomVocab,
): Promise<object> => {
	switch (event.name) {
		case 'create_persona': {
			return randomPersonaParams();
		}
		case 'create_community': {
			if (!persona) persona = await random.persona(account);
			return randomCommunityParams(persona.persona_id);
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
		case 'create_file': {
			if (!persona) persona = await random.persona(account);
			if (!space) space = await random.space(persona, account, community);
			return randomFileParams(persona.persona_id, space.space_id);
		}
		case 'read_community': {
			if (!community) community = await random.community(persona, account);
			return {community_id: community.community_id};
		}
		case 'read_communities': {
			return {};
		}
		case 'read_space': {
			if (!space) space = await random.space(persona, account, community);
			return {space_id: space.space_id};
		}
		case 'read_spaces': {
			if (!community) community = await random.community(persona, account);
			return {community_id: community.community_id};
		}
		case 'read_files': {
			if (!space) space = await random.space(persona, account, community);
			return {space_id: space.space_id};
		}
		// TODO could do an exhaustive typecheck (so it'll be caught by TS, not at runtime)
		// by generating something like a type union of `EventInfo`s and
		// replacing the generic service type in the above function signature
		default: {
			throw Error(`Unhandled service for randomEventParams: ${event.name}`);
		}
	}
};
