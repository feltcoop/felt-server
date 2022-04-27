import type {Service} from '$lib/server/service';
import {pingService} from '$lib/server/pingService';
import {loginAccountService, logoutAccountService} from '$lib/vocab/account/accountServices';
import {createAccountPersonaService, readPersonaService} from '$lib/vocab/persona/personaServices';
import {
	readCommunityService,
	readCommunitiesService,
	createCommunityService,
	updateCommunitySettingsService,
	deleteCommunityService,
} from '$lib/vocab/community/communityServices';
import {
	createMembershipService,
	deleteMembershipService,
} from '$lib/vocab/membership/membershipServices';
import {
	readEntitiesService,
	ReadEntitiesPaginatedService,
	createEntityService,
	updateEntityService,
	eraseEntityService,
	deleteEntitiesService,
} from '$lib/vocab/entity/entityServices';
import {
	readSpaceService,
	readSpacesService,
	createSpaceService,
	updateSpaceService,
	deleteSpaceService,
} from '$lib/vocab/space/spaceServices';
import {createTieService, readTiesService, deleteTieService} from '$lib/vocab/tie/tieServices';

export const services: Map<string, Service<any, any>> = new Map(
	[
		pingService,
		loginAccountService,
		logoutAccountService,
		createAccountPersonaService,
		readPersonaService,
		createCommunityService,
		createMembershipService,
		deleteMembershipService,
		createSpaceService,
		createEntityService,
		updateEntityService,
		eraseEntityService,
		deleteEntitiesService,
		readCommunityService,
		readCommunitiesService,
		updateCommunitySettingsService,
		deleteCommunityService,
		readSpaceService,
		readSpacesService,
		readEntitiesService,
		ReadEntitiesPaginatedService,
		updateSpaceService,
		deleteSpaceService,
		createTieService,
		readTiesService,
		deleteTieService,
	].map((s) => [s.event.name, s]),
);
