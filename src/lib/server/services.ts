import type {Service} from '$lib/server/service';
import {pingService} from '$lib/server/pingService';
import {loginAccountService, logoutAccountService} from '$lib/vocab/account/accountServices';
import {createPersonaService} from '$lib/vocab/persona/personaServices';
import {
	readCommunityService,
	readCommunitiesService,
	createCommunityService,
	updateCommunitySettingsService,
} from '$lib/vocab/community/communityServices';
import {
	createMembershipService,
	deleteMembershipService,
} from '$lib/vocab/membership/membershipServices';
import {
	readEntitiesService,
	createEntityService,
	updateEntityService,
} from '$lib/vocab/entity/entityServices';
import {
	readSpaceService,
	readSpacesService,
	createSpaceService,
	deleteSpaceService,
} from '$lib/vocab/space/spaceServices';

export const services: Map<string, Service<any, any>> = new Map(
	[
		pingService,
		loginAccountService,
		logoutAccountService,
		createPersonaService,
		createCommunityService,
		createMembershipService,
		deleteMembershipService,
		createSpaceService,
		createEntityService,
		updateEntityService,
		readCommunityService,
		readCommunitiesService,
		updateCommunitySettingsService,
		readSpaceService,
		readSpacesService,
		readEntitiesService,
		deleteSpaceService,
	].map((s) => [s.event.name, s]),
);
