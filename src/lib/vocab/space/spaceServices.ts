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

//Returns a single space object
export const readSpaceService: Service<ReadSpaceParams, ReadSpaceResponseResult> = {
	event: ReadSpace,
	perform: async ({server, params}) => {
		const {db} = server;

		console.log('[ReadSpace] space', params.space_id);

		const findSpaceResult = await db.repos.space.findById(params.space_id);
		if (findSpaceResult.ok) {
			return {ok: true, status: 200, value: {space: findSpaceResult.value}};
		} else {
			console.log('[ReadSpace] no space found');
			return {
				ok: false,
				status: findSpaceResult.type === 'no_space_found' ? 404 : 500,
				reason: findSpaceResult.reason,
			};
		}
	},
};

//Returns all spaces in a given community
export const readSpacesService: Service<ReadSpacesParams, ReadSpacesResponseResult> = {
	event: ReadSpaces,
	perform: async ({server, params}) => {
		const {db} = server;

		console.log('[ReadSpaces] retrieving spaces for community', params.community_id);

		const findSpacesResult = await db.repos.space.filterByCommunity(params.community_id);
		if (findSpacesResult.ok) {
			return {ok: true, status: 200, value: {spaces: findSpacesResult.value}};
		} else {
			console.log('[ReadSpaces] error searching for community spaces');
			return {ok: false, status: 500, reason: 'error searching for community spaces'};
		}
	},
};

//Creates a new space for a given community
export const createSpaceService: Service<CreateSpaceParams, CreateSpaceResponseResult> = {
	event: CreateSpace,
	// TODO security: verify the `account_id` has permission to modify this space
	// TODO add `actor_id` and verify it's one of the `account_id`'s personas
	perform: async ({server, params}) => {
		const {db} = server;
		console.log('[CreateSpace] validating space url uniqueness');
		const findByCommunityUrlResult = await db.repos.space.findByCommunityUrl(
			params.community_id,
			params.url,
		);

		if (!findByCommunityUrlResult.ok) {
			console.log('[CreateSpace] error validating unique url for new space');
			return {ok: false, status: 500, reason: 'error validating unique url for new space'};
		}

		if (findByCommunityUrlResult.value) {
			console.log('[CreateSpace] provided url for space already exists');
			return {ok: false, status: 409, reason: 'a space with that url already exists'};
		}

		console.log('[CreateSpace] creating space for community', params.community_id);
		const createSpaceResult = await db.repos.space.create(
			params.name,
			params.content,
			params.media_type,
			params.url,
			params.community_id,
		);
		if (createSpaceResult.ok) {
			return {ok: true, status: 200, value: {space: createSpaceResult.value}};
		} else {
			console.log('[CreateSpace] error searching for community spaces');
			return {ok: false, status: 500, reason: 'error searching for community spaces'};
		}
	},
};

//deletes a single space and returns the id of the deleted spaces
export const deleteSpaceService: Service<DeleteSpaceParams, DeleteSpaceResponseResult> = {
	event: DeleteSpace,
	perform: async ({server, params}) => {
		const {db} = server;
		console.log('[DeleteSpace] deleting space with id:', params.space_id);
		const result = await db.repos.space.deleteById(params.space_id);
		console.log(result);
		if (!result.ok) {
			console.log('[DeleteSpace] error removing space: ', params.space_id);
			return {ok: false, status: 500, reason: result.reason};
		}
		return {ok: true, status: 200, value: null};
	},
};
