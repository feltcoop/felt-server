import type {TSchema} from '@sinclair/typebox';

import type {Service} from '$lib/server/service';
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

export const services: Map<string, Service<TSchema, TSchema>> = new Map(
	// TODO verify no duplicate names?
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
