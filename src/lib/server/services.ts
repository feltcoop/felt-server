import type {TSchema, Static} from '@sinclair/typebox';

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
import type {RandomVocab, RandomVocabContext} from '$lib/vocab/random';
import {randomCommunityParams, randomContent, randomSpaceParams} from '$lib/vocab/random';

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

// TODO fix hardcoded ids, improve types
export const randomServiceParams = async <TParamsSchema extends TSchema>(
	service: Service<TParamsSchema, TSchema>,
	random: RandomVocabContext,
	{account, persona, community}: RandomVocab,
): Promise<Static<TParamsSchema>> => {
	switch (service.name) {
		case 'read_community': {
			return {community_id: 1} as any;
		}
		case 'read_communities': {
			return {} as any;
		}
		case 'create_community': {
			if (!account) account = await random.account();
			if (!persona) persona = await random.persona(account);
			return randomCommunityParams(persona.persona_id) as any;
		}
		case 'create_member': {
			if (!account) account = await random.account();
			if (!persona) persona = await random.persona(account);
			if (!community) community = await random.community();
			return {persona_id: persona.persona_id, community_id: community.community_id} as any;
		}
		case 'read_files': {
			return {space_id: 1} as any;
		}
		case 'create_file': {
			return {actor_id: 1, space_id: 1, content: randomContent()} as any;
		}
		case 'read_space': {
			return {space_id: 1} as any;
		}
		case 'read_spaces': {
			return {community_id: 1} as any;
		}
		case 'create_space': {
			return randomSpaceParams(1) as any;
		}
		default: {
			throw Error(`Unhandled service: ${service.name}`);
		}
	}
};
