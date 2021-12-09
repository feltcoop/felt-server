import type {Service} from '$lib/server/service';
import {pingService} from '$lib/server/pingService';
import {createPersonaService} from '$lib/vocab/persona/personaServices';
import {
	readCommunityService,
	readCommunitiesService,
	createCommunityService,
	setCommunityHueService,
	createMembershipService,
} from '$lib/vocab/community/communityServices';
import {readFilesService, createFileService} from '$lib/vocab/file/fileServices';
import {
	readSpaceService,
	readSpacesService,
	createSpaceService,
	deleteSpaceService,
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
		setCommunityHueService,
		readSpaceService,
		readSpacesService,
		readFilesService,
		deleteSpaceService,
	].map((s) => [s.event.name, s]),
);
