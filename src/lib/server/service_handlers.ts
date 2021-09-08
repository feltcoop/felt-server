import type {Service, ServiceParamsSchema, ServiceResponseData} from '$lib/server/service';
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

export const service_handlers: Map<
	string,
	Service<ServiceParamsSchema, ServiceResponseData>
> = new Map(
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
