import type {Service} from '$lib/server/service';
import {pingService} from '$lib/server/pingService';
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

export const services: Map<string, Service<any, any>> = new Map(
	[
		pingService,
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
	].map((s) => [s.event.name, s]),
);
