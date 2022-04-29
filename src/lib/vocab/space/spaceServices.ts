import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {ServiceRequest} from '$lib/server/service';
import type {ServiceByName} from '$lib/app/eventTypes';
import {
	CreateSpace,
	ReadSpace,
	ReadSpaces,
	UpdateSpace,
	DeleteSpace,
} from '$lib/vocab/space/spaceEvents';
import {canDeleteSpace} from '$lib/vocab/space/spaceHelpers';
import type {Community} from '$lib/vocab/community/community';
import type {Result} from '@feltcoop/felt';
import type {Space} from '$lib/vocab/space/space';
import type {ErrorResponse} from '$lib/util/error';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';

const log = new Logger(gray('[') + blue('spaceServices') + gray(']'));

//Returns a single space object
export const ReadSpaceService: ServiceByName['ReadSpace'] = {
	event: ReadSpace,
	perform: async ({repos, params}) => {
		log.trace('[ReadSpace] space', params.space_id);

		const findSpaceResult = await repos.space.findById(params.space_id);
		if (!findSpaceResult.ok) {
			log.trace('[ReadSpace] no space found');
			return {ok: false, status: 404, message: 'no space found'};
		}
		return {ok: true, status: 200, value: {space: findSpaceResult.value}};
	},
};

//Returns all spaces in a given community
export const ReadSpacesService: ServiceByName['ReadSpaces'] = {
	event: ReadSpaces,
	perform: async ({repos, params}) => {
		log.trace('[ReadSpaces] retrieving spaces for community', params.community_id);

		const findSpacesResult = await repos.space.filterByCommunity(params.community_id);
		if (!findSpacesResult.ok) {
			log.trace('[ReadSpaces] error searching for community spaces');
			return {ok: false, status: 500, message: 'error searching for community spaces'};
		}
		return {ok: true, status: 200, value: {spaces: findSpacesResult.value}};
	},
};

//Creates a new space for a given community
export const CreateSpaceService: ServiceByName['CreateSpace'] = {
	event: CreateSpace,
	// TODO security: verify the `account_id` has permission to modify this space
	// TODO verify `params.persona_id` is  one of the `account_id`'s personas
	perform: async ({repos, params}) => {
		log.trace('[CreateSpace] validating space url uniqueness');
		const findByCommunityUrlResult = await repos.space.findByCommunityUrl(
			params.community_id,
			params.url,
		);

		if (!findByCommunityUrlResult.ok) {
			log.trace('[CreateSpace] error validating unique url for new space');
			return {ok: false, status: 500, message: 'error validating unique url for new space'};
		}

		if (findByCommunityUrlResult.value) {
			log.trace('[CreateSpace] provided url for space already exists');
			return {ok: false, status: 409, message: 'a space with that url already exists'};
		}

		log.trace('[CreateSpace] finding community space for dir actor');
		const communityPersona = await repos.persona.findByCommunityId(params.community_id);
		if (!communityPersona.ok) {
			log.error('[CreateSpace] error finding persona for provided community', params.community_id);
			return {ok: false, status: 500, message: 'error looking up community persona'};
		}

		log.trace('[CreateSpace] initializing directory for space');
		const createDirectoryResult = await repos.entity.create(communityPersona.value.persona_id, {
			type: 'Collection',
			name: 'directory',
		});
		if (!createDirectoryResult.ok) {
			log.error('[CreateSpace] error creating directory for space', params.name);
			return {ok: false, status: 500, message: 'error creating directory for space'};
		}

		log.trace('[CreateSpace] creating space for community', params.community_id);
		const createSpaceResult = await repos.space.create(
			params.name,
			params.view,
			params.url,
			params.icon,
			params.community_id,
			createDirectoryResult.value.entity_id,
		);
		if (!createSpaceResult.ok) {
			log.trace('[CreateSpace] error searching for community spaces');
			return {ok: false, status: 500, message: 'error searching for community spaces'};
		}
		return {ok: true, status: 200, value: {space: createSpaceResult.value}};
	},
};

export const UpdateSpaceService: ServiceByName['UpdateSpace'] = {
	event: UpdateSpace,
	perform: async ({repos, params}) => {
		const {space_id, ...partial} = params;
		const updateEntitiesResult = await repos.space.update(space_id, partial);
		if (!updateEntitiesResult.ok) {
			log.trace('[UpdateSpace] error updating space');
			return {ok: false, status: 500, message: 'failed to update space'};
		}
		return {ok: true, status: 200, value: {space: updateEntitiesResult.value}};
	},
};

//deletes a single space
export const DeleteSpaceService: ServiceByName['DeleteSpace'] = {
	event: DeleteSpace,
	perform: async ({repos, params}) => {
		log.trace('[DeleteSpace] deleting space with id:', params.space_id);

		// Check that the space can be deleted.
		const findSpaceResult = await repos.space.findById(params.space_id);
		if (!findSpaceResult.ok) {
			return {ok: false, status: 404, message: 'no space found'};
		}
		const space = findSpaceResult.value;
		if (!canDeleteSpace(space)) {
			return {ok: false, status: 405, message: 'cannot delete home space'};
		}

		const result = await repos.space.deleteById(params.space_id);
		log.trace('[DeleteSpace] result', result);
		if (!result.ok) {
			log.trace('[DeleteSpace] error removing space: ', params.space_id);
			return {ok: false, status: 500, message: 'failed to delete space'};
		}
		return {ok: true, status: 200, value: null};
	},
};

export const createDefaultSpaces = async (
	serviceRequest: ServiceRequest<any>,
	persona_id: number,
	community: Community,
): Promise<Result<{value: Space[]}, ErrorResponse>> => {
	const spaces: Space[] = [];
	for (const params of toDefaultSpaces(persona_id, community)) {
		// eslint-disable-next-line no-await-in-loop
		const result = await CreateSpaceService.perform({
			...serviceRequest,
			params,
		});
		if (!result.ok) return {ok: false, message: 'failed to create default spaces'};
		spaces.push(result.value.space);
	}
	return {ok: true, value: spaces};
};
