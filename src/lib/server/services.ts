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
import {
	randomFileParams,
	randomMemberParams,
	RandomVocab,
	RandomVocabContext,
} from '$lib/vocab/random';
import {randomCommunityParams, randomSpaceParams} from '$lib/vocab/random';

export const services: Map<string, Service<TSchema, TSchema>> = new Map(
	// TODO verify no duplicate names?
	[
		createCommunityService,
		createMemberService,
		createSpaceService,
		createFileService,
		readCommunityService,
		readCommunitiesService,
		readSpaceService,
		readSpacesService,
		readFilesService,
	].map((s) => [s.name, s]),
);
