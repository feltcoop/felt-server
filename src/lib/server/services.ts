import type {TSchema} from '@sinclair/typebox';

import type {Service} from '$lib/server/service';
import {createPersonaService} from '$lib/vocab/persona/personaServices';
import {
	readCommunityService,
	readCommunitiesService,
	createCommunityService,
	createMembershipService,
} from '$lib/vocab/community/communityServices';
import {readFilesService, createFileService} from '$lib/vocab/file/fileServices';
import {
	readSpaceService,
	readSpacesService,
	createSpaceService,
} from '$lib/vocab/space/spaceServices';

export const services: Map<string, Service<TSchema, TSchema>> = new Map(
	// TODO verify no duplicate names?
	[
		createPersonaService,
		createCommunityService,
		createMembershipService,
		createSpaceService,
		createFileService,
		readCommunityService,
		readCommunitiesService,
		readSpaceService,
		readSpacesService,
		readFilesService,
	].map((s) => [s.name, s]),
);
