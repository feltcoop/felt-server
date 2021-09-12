import type {TSchema} from '@sinclair/typebox';

import type {Service} from '$lib/server/service';
import {
	readCommunityService,
	readCommunitiesService,
	createCommunityService,
	createMemberService,
} from '$lib/vocab/community/communityServices';
import {readFilesService, createFileService} from '$lib/vocab/file/fileServices';
import {
	readSpaceService,
	readSpacesService,
	createSpaceService,
} from '$lib/vocab/space/spaceServices';
import {randomFileParams, RandomVocab, RandomVocabContext} from '$lib/vocab/random';
import {randomCommunityParams, randomSpaceParams} from '$lib/vocab/random';

export const services: Map<string, Service<TSchema, TSchema>> = new Map(
	// TODO verify no duplicate names?
	[
		readCommunityService,
		readCommunitiesService,
		createCommunityService,
		createMemberService,
		readFilesService,
		createFileService,
		readSpaceService,
		readSpacesService,
		createSpaceService,
	].map((s) => [s.name, s]),
);

// TODO keep factoring this until it's fully automated, generating from the schema
export const randomServiceParams = async <TParamsSchema extends TSchema>(
	service: Service<TParamsSchema, TSchema>,
	random: RandomVocabContext,
	{account, persona, community, space}: RandomVocab,
): Promise<object> => {
	switch (service.name) {
		case 'read_community': {
			if (!community) community = await random.community(persona, account);
			return {community_id: community.community_id};
		}
		case 'read_communities': {
			return {};
		}
		case 'create_community': {
			if (!persona) persona = await random.persona(account);
			return randomCommunityParams(persona.persona_id);
		}
		case 'create_member': {
			if (!persona) persona = await random.persona(account);
			if (!community) community = await random.community(); // don't forward `persona`/`account` bc that's the service's job
			return {persona_id: persona.persona_id, community_id: community.community_id};
		}
		case 'read_files': {
			if (!space) space = await random.space(persona, account, community);
			return {space_id: space.space_id};
		}
		case 'create_file': {
			if (!persona) persona = await random.persona(account);
			if (!space) space = await random.space(persona, account, community);
			return randomFileParams(persona.persona_id, space.space_id);
		}
		case 'read_space': {
			if (!space) space = await random.space(persona, account, community);
			return {space_id: space.space_id};
		}
		case 'read_spaces': {
			if (!community) community = await random.community(persona, account);
			return {community_id: community.community_id};
		}
		case 'create_space': {
			if (!community) community = await random.community(persona, account);
			return randomSpaceParams(community.community_id);
		}
		default: {
			throw Error(`Unhandled service: ${service.name}`);
		}
	}
};
