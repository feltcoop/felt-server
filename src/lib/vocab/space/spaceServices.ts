import type {Service} from '$lib/server/service';

//Returns a single space object
export const readSpaceService: Service<{space_id: number}> = {
	handle: async (server, params) => {
		const {db} = server;

		console.log('[space_middleware] space', params.space_id);

		const find_space_result = await db.repos.space.find_by_id(params.space_id as any); // TODO remove the typecast once this PR is rebased
		if (find_space_result.ok) {
			return {code: 200, data: {space: find_space_result.value}};
		} else {
			console.log('no space found');
			const code = find_space_result.type === 'no_space_found' ? 404 : 500;
			return {code, data: {reason: find_space_result.reason}};
		}
	},
};

//Returns all spaces in a given community
export const readSpacesService: Service<{community_id: number}> = {
	handle: async (server, params) => {
		const {db} = server;

		console.log('[space_middleware] retrieving spaces for community', params.community_id);

		const find_spaces_result = await db.repos.space.filter_by_community(params.community_id as any); // TODO remove the typecast once this PR is rebased
		if (find_spaces_result.ok) {
			return {code: 200, data: {spaces: find_spaces_result.value}};
		} else {
			console.log('[space_middleware] error searching for community spaces');
			return {code: 500, data: {reason: 'error searching for community spaces'}};
		}
	},
};

//Creates a new space for a given community
export const createSpaceService: Service<{
	community_id: number;
	// TODO change to `SpaceParams`? Union with Typebox?
	name: string;
	url: string;
	media_type: string;
	content: string;
}> = {
	// TODO verify the `account_id` has permission to modify this space
	handle: async (server, params) => {
		const {db} = server;

		console.log('[space_middleware] creating space for community', params.community_id);

		const create_space_result = await db.repos.space.insert(Number(params.community_id), {
			name: params.name,
			url: params.url,
			media_type: params.media_type,
			content: params.content,
		});
		if (create_space_result.ok) {
			return {code: 200, data: {space: create_space_result.value}};
		} else {
			console.log('[space_middleware] error searching for community spaces');
			return {code: 500, data: {reason: 'error searching for community spaces'}};
		}
	},
};
