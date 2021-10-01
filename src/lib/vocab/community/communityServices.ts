import {Type} from '@sinclair/typebox';

import type {Service} from '$lib/server/service';
import {CommunitySchema} from '$lib/vocab/community/community';
import {MembershipSchema} from '$lib/vocab/membership/membership';
import {toValidateSchema} from '$lib/util/ajv';

const ReadCommunitiesServiceParams = Type.Object(
	{
		// TODO query params
	},
	{$id: 'ReadCommunitiesServiceParams', additionalProperties: false},
);
const ReadCommunitiesServiceResponse = Type.Object(
	{
		communities: Type.Array(CommunitySchema),
	},
	{$id: 'ReadCommunitiesServiceResponse', additionalProperties: false},
);

// Returns a list of community objects
export const readCommunitiesService: Service<
	typeof ReadCommunitiesServiceParams,
	typeof ReadCommunitiesServiceResponse
> = {
	name: 'read_communities',
	route: {
		path: '/api/v1/communities',
		method: 'GET',
	},
	paramsSchema: ReadCommunitiesServiceParams,
	validateParams: toValidateSchema(ReadCommunitiesServiceParams),
	responseSchema: ReadCommunitiesServiceResponse,
	validateResponse: toValidateSchema(ReadCommunitiesServiceResponse),
	perform: async ({server, account_id}) => {
		const {db} = server;
		const findCommunitiesResult = await db.repos.community.filterByAccount(account_id);
		if (findCommunitiesResult.ok) {
			return {ok: true, status: 200, value: {communities: findCommunitiesResult.value}};
		} else {
			console.log('[read_communities] error searching for communities');
			return {ok: false, status: 500, reason: 'error searching for communities'};
		}
	},
};

const ReadCommunityServiceParams = Type.Object(
	{
		community_id: Type.Number(),
	},
	{$id: 'ReadCommunityServiceParams', additionalProperties: false},
);
const ReadCommunityServiceResponse = Type.Object(
	{
		community: CommunitySchema,
	},
	{$id: 'ReadCommunityServiceResponse', additionalProperties: false},
);

//Returns a single community object
export const readCommunityService: Service<
	typeof ReadCommunityServiceParams,
	typeof ReadCommunityServiceResponse
> = {
	name: 'read_community',
	route: {
		path: '/api/v1/communities/:community_id',
		method: 'GET',
	},
	paramsSchema: ReadCommunityServiceParams,
	validateParams: toValidateSchema(ReadCommunityServiceParams),
	responseSchema: ReadCommunityServiceResponse,
	validateResponse: toValidateSchema(ReadCommunityServiceResponse),
	perform: async ({server, params, account_id}) => {
		const {db} = server;
		console.log('[read_community] account', account_id); // TODO logging
		console.log('[read_community] community', params.community_id);

		const findCommunityResult = await db.repos.community.findById(params.community_id);
		if (findCommunityResult.ok) {
			return {ok: true, status: 200, value: {community: findCommunityResult.value}};
		} else {
			return {
				ok: false,
				status: findCommunityResult.type === 'no_community_found' ? 404 : 500,
				reason: findCommunityResult.reason,
			};
		}
	},
};

const CreateCommunityServiceParams = Type.Object(
	{
		name: Type.String(),
		persona_id: Type.Number(),
	},
	{$id: 'CreateCommunityServiceParams', additionalProperties: false},
);
const CreateCommunityServiceResponse = Type.Object(
	{
		community: CommunitySchema,
	},
	{$id: 'CreateCommunityServiceResponse', additionalProperties: false},
);

//Creates a new community for an instance
export const createCommunityService: Service<
	typeof CreateCommunityServiceParams,
	typeof CreateCommunityServiceResponse
> = {
	name: 'create_community',
	route: {
		path: '/api/v1/communities',
		method: 'POST',
	},
	paramsSchema: CreateCommunityServiceParams,
	validateParams: toValidateSchema(CreateCommunityServiceParams),
	responseSchema: CreateCommunityServiceResponse,
	validateResponse: toValidateSchema(CreateCommunityServiceResponse),
	// TODO declarative validation for `req.body` and the rest
	perform: async ({server, params, account_id}) => {
		if (!params.name) {
			// TODO declarative validation
			return {
				ok: false,
				status: 400,
				reason: 'invalid name',
			};
		}
		console.log('created community account_id', account_id);
		// TODO validate that `account_id` is `persona_id`
		const createCommunityResult = await server.db.repos.community.create(params);
		console.log('createCommunityResult', createCommunityResult);
		if (createCommunityResult.ok) {
			// TODO optimize this to return `createCommunityResult.value` instead of making another db call,
			// needs to populate members, but we probably want to normalize the data, returning only ids
			const communityData = await server.db.repos.community.filterByAccount(account_id);
			if (communityData.ok) {
				const {community_id} = createCommunityResult.value;
				console.log('community_id', community_id);
				console.log('communityData', communityData);
				return {
					ok: true,
					status: 200,
					value: {
						community: communityData.value.find((c) => c.community_id === community_id)!,
					},
				}; // TODO API types
			} else {
				console.log('[create_community] error retrieving community data');
				return {
					ok: false,
					status: 500,
					reason: 'error retrieving community data',
				};
			}
		} else {
			console.log('[create_community] error creating community');
			return {
				ok: false,
				status: 500,
				reason: 'error creating community',
			};
		}
	},
};

const CreateMembershipServiceParams = Type.Object(
	{
		persona_id: Type.Number(),
		community_id: Type.Number(),
	},
	{$id: 'CreateMembershipServiceParams', additionalProperties: false},
);
const CreateMembershipServiceResponse = Type.Object(
	{
		membership: MembershipSchema,
	},
	{$id: 'CreateMembershipServiceResponse', additionalProperties: false},
);

// TODO move to `$lib/vocab/member`
//Creates a new member relation for a community
export const createMembershipService: Service<
	typeof CreateMembershipServiceParams,
	typeof CreateMembershipServiceResponse
> = {
	name: 'create_membership',
	route: {
		path: '/api/v1/memberships',
		method: 'POST',
	},
	paramsSchema: CreateMembershipServiceParams,
	validateParams: toValidateSchema(CreateMembershipServiceParams),
	responseSchema: CreateMembershipServiceResponse,
	validateResponse: toValidateSchema(CreateMembershipServiceResponse),
	perform: async ({server, params}) => {
		console.log('[create_membership] creating membership', params.persona_id, params.community_id);

		const createMembershipResult = await server.db.repos.membership.create(params);
		if (createMembershipResult.ok) {
			return {ok: true, status: 200, value: {membership: createMembershipResult.value}};
		} else {
			console.log('[create_membership] error creating membership');
			return {ok: false, status: 500, reason: 'error creating membership'};
		}
	},
};
