import {Type} from '@sinclair/typebox';

import type {Service} from '$lib/server/service';
import type {Space} from '$lib/vocab/space/space';

const ReadSpaceServiceParams = Type.Object(
	{
		space_id: Type.Number(),
	},
	{additionalProperties: false},
);

//Returns a single space object
export const readSpaceService: Service<typeof ReadSpaceServiceParams, {space: Space}> = {
	name: 'read_space',
	paramsSchema: ReadSpaceServiceParams,
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

const ReadSpacesServiceSchema = Type.Object(
	{
		community_id: Type.Number(),
	},
	{additionalProperties: false},
);

//Returns all spaces in a given community
export const readSpacesService: Service<typeof ReadSpacesServiceSchema, {spaces: Space[]}> = {
	name: 'read_spaces',
	paramsSchema: ReadSpacesServiceSchema,
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

const CreateSpaceServiceSchema = Type.Object(
	{
		// TODO should we do something like this for composition?
		// params: SpaceParamsSchema,
		// or maybe:
		// secureParams: // or `serverParams` or `trustedParams`
		// inputParams: // or `clientParams` or `params` or `untrustedParams` or `unsecureParams`
		community_id: Type.Number(),
		name: Type.String(),
		url: Type.String(),
		media_type: Type.String(),
		content: Type.String(),
	},
	{additionalProperties: false},
);

//Creates a new space for a given community
export const createSpaceService: Service<typeof CreateSpaceServiceSchema, {space: Space}> = {
	name: 'create_space',
	paramsSchema: CreateSpaceServiceSchema,
	// TODO verify the `account_id` has permission to modify this space
	// TODO add `actor_id` and verify it's one of the `account_id`'s personas
	handle: async (server, params) => {
		const {db} = server;

		console.log('[space_middleware] creating space for community', params.community_id);

		const create_space_result = await db.repos.space.create(params);
		if (create_space_result.ok) {
			return {code: 200, data: {space: create_space_result.value}};
		} else {
			console.log('[space_middleware] error searching for community spaces');
			return {code: 500, data: {reason: 'error searching for community spaces'}};
		}
	},
};
