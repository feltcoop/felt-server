import type {Service} from '$lib/server/service';
import {toValidateSchema} from '$lib/util/ajv';
import {
	read_communities,
	read_community,
	create_community,
	create_membership,
} from '$lib/vocab/community/communityEvents';

// Returns a list of community objects
export const readCommunitiesService: Service<
	typeof read_communities.params,
	typeof read_communities.response
> = {
	name: 'read_communities',
	route: {
		path: '/api/v1/communities',
		method: 'GET',
	},
	paramsSchema: read_communities.params,
	validateParams: toValidateSchema(read_communities.params),
	responseSchema: read_communities.response,
	validateResponse: toValidateSchema(read_communities.response),
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

//Returns a single community object
export const readCommunityService: Service<
	typeof read_community.params,
	typeof read_community.response
> = {
	name: 'read_community',
	route: {
		path: '/api/v1/communities/:community_id',
		method: 'GET',
	},
	paramsSchema: read_community.params,
	validateParams: toValidateSchema(read_community.params),
	responseSchema: read_community.response,
	validateResponse: toValidateSchema(read_community.response),
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

//Creates a new community for an instance
// TODO automatic params type and validation
export const createCommunityService: Service<
	typeof create_community.params,
	typeof create_community.response
> = {
	name: 'create_community',
	route: {
		path: '/api/v1/communities',
		method: 'POST',
	},
	paramsSchema: create_community.params,
	validateParams: toValidateSchema(create_community.params),
	responseSchema: create_community.response,
	validateResponse: toValidateSchema(create_community.response),
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

// TODO move to `$lib/vocab/member`
//Creates a new member relation for a community
export const createMembershipService: Service<
	typeof create_membership.params,
	typeof create_membership.response
> = {
	name: 'create_membership',
	route: {
		path: '/api/v1/memberships',
		method: 'POST',
	},
	paramsSchema: create_membership.params,
	validateParams: toValidateSchema(create_membership.params),
	responseSchema: create_membership.response,
	validateResponse: toValidateSchema(create_membership.response),
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
