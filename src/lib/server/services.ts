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
	deleteEntityService,
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
		createPersonaService,
		createCommunityService,
		createMembershipService,
		deleteMembershipService,
		createSpaceService,
		createEntityService,
		updateEntityService,
		deleteEntityService,
		readCommunityService,
		readCommunitiesService,
		updateCommunitySettingsService,
		readSpaceService,
		readSpacesService,
		readEntitiesService,
		updateSpaceService,
		deleteSpaceService,
		createTieService,
		readTiesService,
		deleteTieService,
	].map((s) => [s.event.name, s]),
);
