import {Type} from '@sinclair/typebox';

import type {Service} from '$lib/server/service';
import type {Community} from '$lib/vocab/community/community';
import type {Member} from '$lib/vocab/member/member';
import {MemberParamsSchema} from '$lib/vocab/member/member';

const ReadCommunitiesServiceParams = Type.Object(
	{
		// TODO query params
	},
	{additionalProperties: false},
);

// Returns a list of community objects
export const readCommunitiesService: Service<
	typeof ReadCommunitiesServiceParams,
	{communities: Community[]}
> = {
	name: 'read_communities',
	route: {
		path: '/api/v1/communities',
		method: 'get',
	},
	paramsSchema: ReadCommunitiesServiceParams,
	handle: async (server, _params, account_id) => {
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
	{additionalProperties: false},
);

//Returns a single community object
export const readCommunityService: Service<
	typeof ReadCommunityServiceParams,
	{community: Community}
> = {
	name: 'read_community',
	route: {
		path: '/api/v1/communities/:community_id',
		method: 'get',
	},
	paramsSchema: ReadCommunityServiceParams,
	handle: async (server, params, account_id) => {
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
	{additionalProperties: false},
);

//Creates a new community for an instance
// TODO automatic params type and validation
export const createCommunityService: Service<
	typeof CreateCommunityServiceParams,
	{community: Community}
> = {
	name: 'create_community',
	route: {
		path: '/api/v1/communities',
		method: 'post',
	},
	paramsSchema: CreateCommunityServiceParams,
	// TODO declarative validation for `req.body` and the rest
	handle: async (server, params, account_id) => {
		const {name} = params;
		if (!name) {
			// TODO declarative validation
			return {code: 400, data: {reason: 'invalid name'}};
		}
		console.log('created community account_id', account_id);
		// TODO validate that `account_id` is `persona_id`
		const createCommunityResult = await server.db.repos.community.create(name, params.persona_id);
		console.log('createCommunityResult', createCommunityResult);
		if (createCommunityResult.ok) {
			// TODO optimize this to return `createCommunityResult.value` instead of making another db call,
			// needs to populate members, but we probably want to normalize the data, returning only ids
			const communityData = await server.db.repos.community.filterByAccount(account_id);
			if (communityData.ok) {
				const {community_id} = createCommunityResult.value;
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

const CreateMemberServiceParams = MemberParamsSchema;

// TODO move to `$lib/vocab/member`
//Creates a new member relation for a community
export const createMemberService: Service<typeof CreateMemberServiceParams, {member: Member}> = {
	name: 'create_member',
	route: {
		path: '/api/v1/members',
		method: 'post',
	},
	paramsSchema: CreateMemberServiceParams,
	handle: async (server, params) => {
		console.log('[create_member] creating member', params.persona_id, params.community_id);

		const createMemberResult = await server.db.repos.member.create(
			params.persona_id,
			params.community_id,
		);
		if (createMemberResult.ok) {
			return {code: 200, data: {member: createMemberResult.value}};
		} else {
			console.log('[create_member] error creating member');
			return {code: 500, data: {reason: 'error creating member'}};
		}
	},
};
