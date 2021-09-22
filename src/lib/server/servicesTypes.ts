import type {Static} from '@sinclair/typebox';

import type {createPersonaService} from '$lib/vocab/persona/personaServices';
import type {
	createCommunityService,
	createMembershipService,
	readCommunitiesService,
	readCommunityService,
} from '$lib/vocab/community/communityServices';
import type {
	createSpaceService,
	readSpaceService,
	readSpacesService,
} from '$lib/vocab/space/spaceServices';
import type {createFileService, readFilesService} from '$lib/vocab/file/fileServices';

// TODO generate this file -- need the stringified type from the schemas (json-schema-to-typescript?)

export interface ServicesParamsMap {
	create_persona: Static<typeof createPersonaService['paramsSchema']>;
	create_community: Static<typeof createCommunityService['paramsSchema']>;
	create_membership: Static<typeof createMembershipService['paramsSchema']>;
	create_space: Static<typeof createSpaceService['paramsSchema']>;
	create_file: Static<typeof createFileService['paramsSchema']>;
	read_community: Static<typeof readCommunityService['paramsSchema']>;
	read_communities: Static<typeof readCommunitiesService['paramsSchema']>;
	read_space: Static<typeof readSpaceService['paramsSchema']>;
	read_spaces: Static<typeof readSpacesService['paramsSchema']>;
	read_files: Static<typeof readFilesService['paramsSchema']>;
}

export interface ServicesResultMap {
	create_persona: Static<typeof createPersonaService['responseSchema']>;
	create_community: Static<typeof createCommunityService['responseSchema']>;
	create_membership: Static<typeof createMembershipService['responseSchema']>;
	create_space: Static<typeof createSpaceService['responseSchema']>;
	create_file: Static<typeof createFileService['responseSchema']>;
	read_community: Static<typeof readCommunityService['responseSchema']>;
	read_communities: Static<typeof readCommunitiesService['responseSchema']>;
	read_space: Static<typeof readSpaceService['responseSchema']>;
	read_spaces: Static<typeof readSpacesService['responseSchema']>;
	read_files: Static<typeof readFilesService['responseSchema']>;
}
