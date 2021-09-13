import {Type} from '@sinclair/typebox';

import type {Service} from '$lib/server/service';
import {CommunitySchema} from '$lib/vocab/community/community';
import {MemberSchema} from '$lib/vocab/member/member';
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
		method: 'get',
	},
	paramsSchema: ReadCommunitiesServiceParams,
	validateParams: toValidateSchema(ReadCommunitiesServiceParams),
	responseSchema: ReadCommunitiesServiceResponse,
	validateResponse: toValidateSchema(ReadCommunitiesServiceResponse),
	perform: async (server, _params, account_id) => {
		const {db} = server;
		const findCommunitiesResult = await db.repos.community.filterByAccount(account_id);
		if (findCommunitiesResult.ok) {
			return {code: 200, data: {communities: findCommunitiesResult.value}};
		} else {
			console.log('[read_communities] error searching for communities');
			return {code: 500, data: {reason: 'error searching for communities'}};
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
		method: 'get',
	},
	paramsSchema: ReadCommunityServiceParams,
	validateParams: toValidateSchema(ReadCommunityServiceParams),
	responseSchema: ReadCommunityServiceResponse,
	validateResponse: toValidateSchema(ReadCommunityServiceResponse),
	perform: async (server, params, account_id) => {
		const {db} = server;
		console.log('[read_community] account', account_id); // TODO logging
		console.log('[read_community] community', params.community_id);

		const findCommunityResult = await db.repos.community.findById(params.community_id as any); // TODO remove the typecast once this PR is rebased
		if (findCommunityResult.ok) {
			return {code: 200, data: {community: findCommunityResult.value}};
		} else {
			return {
				code: findCommunityResult.type === 'no_community_found' ? 404 : 500,
				data: {reason: findCommunityResult.reason},
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
// TODO automatic params type and validation
export const createCommunityService: Service<
	typeof CreateCommunityServiceParams,
	typeof CreateCommunityServiceResponse
> = {
	name: 'create_community',
	route: {
		path: '/api/v1/communities',
		method: 'post',
	},
	paramsSchema: CreateCommunityServiceParams,
	validateParams: toValidateSchema(CreateCommunityServiceParams),
	responseSchema: CreateCommunityServiceResponse,
	validateResponse: toValidateSchema(CreateCommunityServiceResponse),
	// TODO declarative validation for `req.body` and the rest
	perform: async (server, params, account_id) => {
		if (!params.name) {
			// TODO declarative validation
			return {code: 400, data: {reason: 'invalid name'}};
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
					code: 200,
					data: {
						community: communityData.value.find((c) => c.community_id === community_id)!,
					},
				}; // TODO API types
			} else {
				console.log('[create_community] error retrieving community data');
				return {code: 500, data: {reason: 'error retrieving community data'}};
			}
		} else {
			console.log('[create_community] error creating community');
			return {code: 500, data: {reason: 'error creating community'}};
		}
	},
};

const CreateMemberServiceParams = Type.Object(
	{
		persona_id: Type.Number(),
		community_id: Type.Number(),
	},
	{$id: 'CreateMemberServiceParams', additionalProperties: false},
);
const CreateMemberServiceResponse = Type.Object(
	{
		member: MemberSchema,
	},
	{$id: 'CreateMemberServiceResponse', additionalProperties: false},
);

// TODO move to `$lib/vocab/member`
//Creates a new member relation for a community
export const createMemberService: Service<
	typeof CreateMemberServiceParams,
	typeof CreateMemberServiceResponse
> = {
	name: 'create_member',
	route: {
		path: '/api/v1/members',
		method: 'post',
	},
	paramsSchema: CreateMemberServiceParams,
	validateParams: toValidateSchema(CreateMemberServiceParams),
	responseSchema: CreateMemberServiceResponse,
	validateResponse: toValidateSchema(CreateMemberServiceResponse),
	perform: async (server, params) => {
		console.log('[create_member] creating member', params.persona_id, params.community_id);

		const createMemberResult = await server.db.repos.member.create(params);
		if (createMemberResult.ok) {
			return {code: 200, data: {member: createMemberResult.value}};
		} else {
			console.log('[create_member] error creating member');
			return {code: 500, data: {reason: 'error creating member'}};
		}
	},
};
