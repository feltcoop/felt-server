import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Service} from '$lib/server/service';
import type {
	CreateSpaceParams,
	CreateSpaceResponseResult,
	ReadSpaceParams,
	ReadSpaceResponseResult,
	ReadSpacesParams,
	ReadSpacesResponseResult,
	DeleteSpaceParams,
	DeleteSpaceResponseResult,
} from '$lib/app/eventTypes';
import {CreateSpace, ReadSpace, ReadSpaces, DeleteSpace} from '$lib/vocab/space/space.events';

const log = new Logger(gray('[') + blue('spaceServices') + gray(']'));

//Returns a single space object
export const readSpaceService: Service<ReadSpaceParams, ReadSpaceResponseResult> = {
	event: ReadSpace,
	perform: async ({repos, params}) => {
		log.trace('[ReadSpace] space', params.space_id);

		const findSpaceResult = await repos.space.findById(params.space_id);
		if (findSpaceResult.ok) {
			return {ok: true, status: 200, value: {space: findSpaceResult.value}};
		}
		log.trace('[ReadSpace] no space found');
		return {
			ok: false,
			status: findSpaceResult.type === 'no_space_found' ? 404 : 500,
			message: findSpaceResult.message,
		};
	},
};

//Returns all spaces in a given community
export const readSpacesService: Service<ReadSpacesParams, ReadSpacesResponseResult> = {
	event: ReadSpaces,
	perform: async ({repos, params}) => {
		log.trace('[ReadSpaces] retrieving spaces for community', params.community_id);

		const findSpacesResult = await repos.space.filterByCommunity(params.community_id);
		if (findSpacesResult.ok) {
			return {ok: true, status: 200, value: {spaces: findSpacesResult.value}};
		}
		log.trace('[ReadSpaces] error searching for community spaces');
		return {ok: false, status: 500, message: 'error searching for community spaces'};
	},
};

//Creates a new space for a given community
export const createSpaceService: Service<CreateSpaceParams, CreateSpaceResponseResult> = {
	event: CreateSpace,
	// TODO security: verify the `account_id` has permission to modify this space
	// TODO add `actor_id` and verify it's one of the `account_id`'s personas
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

		log.trace('[CreateSpace] creating space for community', params.community_id);
		const createSpaceResult = await repos.space.create(
			params.name,
			params.view,
			params.url,
			params.community_id,
		);
		if (createSpaceResult.ok) {
			return {ok: true, status: 200, value: {space: createSpaceResult.value}};
		}
		log.trace('[CreateSpace] error searching for community spaces');
		return {ok: false, status: 500, message: 'error searching for community spaces'};
	},
};

//deletes a single space and returns the id of the deleted spaces
export const deleteSpaceService: Service<DeleteSpaceParams, DeleteSpaceResponseResult> = {
	event: DeleteSpace,
	perform: async ({repos, params}) => {
		log.trace('[DeleteSpace] deleting space with id:', params.space_id);
		const result = await repos.space.deleteById(params.space_id);
		log.trace('[DeleteSpace] result', result);
		if (!result.ok) {
			log.trace('[DeleteSpace] error removing space: ', params.space_id);
			return {ok: false, status: 500, message: result.message};
		}
		return {ok: true, status: 200, value: null};
	},
};
