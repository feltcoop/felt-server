import type {Service} from '$lib/server/service';
import {pingService} from '$lib/server/pingService';
import {createPersonaService} from '$lib/vocab/persona/personaServices';
import {
	readCommunityService,
	readCommunitiesService,
	createCommunityService,
	updateCommunitySettingsService,
	createMembershipService,
} from '$lib/vocab/community/communityServices';
import {deleteMembershipService} from '$lib/vocab/membership/membershipServices';
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
		deleteMembershipService,
		createSpaceService,
		createFileService,
		readCommunityService,
		readCommunitiesService,
		updateCommunitySettingsService,
		readSpaceService,
		readSpacesService,
		readFilesService,
		deleteSpaceService,
	].map((s) => [s.event.name, s]),
);
