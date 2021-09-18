import {Type} from '@sinclair/typebox';

import type {Service} from '$lib/server/service';
import {SpaceSchema} from '$lib/vocab/space/space';
import {toValidateSchema} from '$lib/util/ajv';

const ReadSpaceServiceParams = Type.Object(
	{
		space_id: Type.Number(),
	},
	{$id: 'ReadSpaceServiceParams', additionalProperties: false},
);
const ReadSpaceServiceResponse = Type.Object(
	{
		space: SpaceSchema,
	},
	{$id: 'ReadSpaceServiceResponse', additionalProperties: false},
);

//Returns a single space object
export const readSpaceService: Service<
	typeof ReadSpaceServiceParams,
	typeof ReadSpaceServiceResponse
> = {
	name: 'read_space',
	route: {
		path: '/api/v1/spaces/:space_id',
		method: 'get',
	},
	paramsSchema: ReadSpaceServiceParams,
	validateParams: toValidateSchema(ReadSpaceServiceParams),
	responseSchema: ReadSpaceServiceResponse,
	validateResponse: toValidateSchema(ReadSpaceServiceResponse),
	perform: async ({server, params}) => {
		const {db} = server;

		console.log('[read_space] space', params.space_id);

		const findSpaceResult = await db.repos.space.findById(params.space_id);
		if (findSpaceResult.ok) {
			return {code: 200, data: {space: findSpaceResult.value}};
		} else {
			console.log('[read_space] no space found');
			const code = findSpaceResult.type === 'no_space_found' ? 404 : 500;
			return {code, data: {reason: findSpaceResult.reason}};
		}
	},
};

const ReadSpacesServiceSchema = Type.Object(
	{
		community_id: Type.Number(),
	},
	{$id: 'ReadSpacesServiceSchema', additionalProperties: false},
);
const ReadSpacesServiceResponse = Type.Object(
	{
		spaces: Type.Array(SpaceSchema),
	},
	{$id: 'ReadSpacesServiceResponse', additionalProperties: false},
);

//Returns all spaces in a given community
export const readSpacesService: Service<
	typeof ReadSpacesServiceSchema,
	typeof ReadSpacesServiceResponse
> = {
	name: 'read_spaces',
	route: {
		path: '/api/v1/communities/:community_id/spaces',
		method: 'get',
	},
	paramsSchema: ReadSpacesServiceSchema,
	validateParams: toValidateSchema(ReadSpacesServiceSchema),
	responseSchema: ReadSpacesServiceResponse,
	validateResponse: toValidateSchema(ReadSpacesServiceResponse),
	perform: async ({server, params}) => {
		const {db} = server;

		console.log('[read_spaces] retrieving spaces for community', params.community_id);

		const findSpacesResult = await db.repos.space.filterByCommunity(params.community_id);
		if (findSpacesResult.ok) {
			return {code: 200, data: {spaces: findSpacesResult.value}};
		} else {
			console.log('[read_spaces] error searching for community spaces');
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
	{$id: 'CreateSpaceServiceSchema', additionalProperties: false},
);
const CreateSpaceServiceResponse = Type.Object(
	{
		space: SpaceSchema,
	},
	{$id: 'CreateSpaceServiceResponse', additionalProperties: false},
);

//Creates a new space for a given community
export const createSpaceService: Service<
	typeof CreateSpaceServiceSchema,
	typeof CreateSpaceServiceResponse
> = {
	name: 'create_space',
	route: {
		path: '/api/v1/communities/:community_id/spaces',
		method: 'post',
	},
	paramsSchema: CreateSpaceServiceSchema,
	validateParams: toValidateSchema(CreateSpaceServiceSchema),
	responseSchema: CreateSpaceServiceResponse,
	validateResponse: toValidateSchema(CreateSpaceServiceResponse),
	// TODO security: verify the `account_id` has permission to modify this space
	// TODO add `actor_id` and verify it's one of the `account_id`'s personas
	perform: async ({server, params}) => {
		const {db} = server;

		console.log('[create_space] creating space for community', params.community_id);

		const createSpaceResult = await db.repos.space.create(params);
		if (createSpaceResult.ok) {
			return {code: 200, data: {space: createSpaceResult.value}};
		} else {
			console.log('[create_space] error searching for community spaces');
			return {code: 500, data: {reason: 'error searching for community spaces'}};
		}
	},
};
