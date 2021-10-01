import type {Service} from '$lib/server/service';
import type {
	create_space_params_type,
	create_space_response_type,
	read_space_params_type,
	read_space_response_type,
	read_spaces_params_type,
	read_spaces_response_type,
} from '$lib/ui/events';
import {create_space, read_space, read_spaces} from '$lib/vocab/space/space.events';

//Returns a single space object
export const readSpaceService: Service<read_space_params_type, read_space_response_type> = {
	event: read_space,
	perform: async ({server, params}) => {
		const {db} = server;

		console.log('[read_space] space', params.space_id);

		const findSpaceResult = await db.repos.space.findById(params.space_id);
		if (findSpaceResult.ok) {
			return {ok: true, status: 200, value: {space: findSpaceResult.value}};
		} else {
			console.log('[read_space] no space found');
			return {
				ok: false,
				status: findSpaceResult.type === 'no_space_found' ? 404 : 500,
				reason: findSpaceResult.reason,
			};
		}
	},
};

//Returns all spaces in a given community
export const readSpacesService: Service<read_spaces_params_type, read_spaces_response_type> = {
	event: read_spaces,
	perform: async ({server, params}) => {
		const {db} = server;

		console.log('[read_spaces] retrieving spaces for community', params.community_id);

		const findSpacesResult = await db.repos.space.filterByCommunity(params.community_id);
		if (findSpacesResult.ok) {
			return {ok: true, status: 200, value: {spaces: findSpacesResult.value}};
		} else {
			console.log('[read_spaces] error searching for community spaces');
			return {ok: false, status: 500, reason: 'error searching for community spaces'};
		}
	},
};

//Creates a new space for a given community
export const createSpaceService: Service<create_space_params_type, create_space_response_type> = {
	event: create_space,
	// TODO security: verify the `account_id` has permission to modify this space
	// TODO add `actor_id` and verify it's one of the `account_id`'s personas
	perform: async ({server, params}) => {
		const {db} = server;
		console.log('[create_space] validating space url uniqueness');
		const findByCommunityUrlResult = await db.repos.space.findByCommunityUrl(
			params.community_id,
			params.url,
		);

		if (!findByCommunityUrlResult.ok) {
			console.log('[create_space] error validating unique url for new space');
			return {ok: false, status: 500, reason: 'error validating unique url for new space'};
		}

		if (findByCommunityUrlResult.value) {
			console.log('[create_space] provided url for space already exists');
			return {ok: false, status: 409, reason: 'a space with that url already exists'};
		}

		console.log('[create_space] creating space for community', params.community_id);
		const createSpaceResult = await db.repos.space.create(params);
		if (createSpaceResult.ok) {
			return {ok: true, status: 200, value: {space: createSpaceResult.value}};
		} else {
			console.log('[create_space] error searching for community spaces');
			return {ok: false, status: 500, reason: 'error searching for community spaces'};
		}
	},
};
