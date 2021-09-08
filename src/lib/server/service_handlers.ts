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

export const service_handlers: {[key: string]: Service<ServiceParamsSchema, ServiceResponseData>} =
	{
		read_community: readCommunityService,
		read_communities: readCommunitiesService,
		create_community: createCommunityService,
		create_member: createMemberService,
		read_files: readFilesService,
		create_file: createFileService,
		read_space: readSpaceService,
		read_spaces: readSpacesService,
		create_space: createSpaceService,
	};
