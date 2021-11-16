import type {Service} from '$lib/server/service';
import type {
	CreateCommunityParamsType,
	create_community_response_type,
	ReadCommunityParamsType,
	read_community_response_type,
	ReadCommunitiesParamsType,
	read_communities_response_type,
} from '$lib/ui/events';
import {
	create_community,
	read_communities,
	read_community,
} from '$lib/vocab/community/community.events';
import type {CreateMembershipParamsType, create_membership_response_type} from '$lib/ui/events';
import {create_membership} from '$lib/vocab/membership/membership.events';

// Returns a list of community objects
export const readCommunitiesService: Service<
	ReadCommunitiesParamsType,
	read_communities_response_type
> = {
	event: read_communities,
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
export const readCommunityService: Service<ReadCommunityParamsType, read_community_response_type> =
	{
		event: read_community,
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
// TODO think about extracting this to a `.services.` file
// that imports a generated type and declares only `perform`
export const createCommunityService: Service<
	CreateCommunityParamsType,
	create_community_response_type
> = {
	event: create_community,
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
	CreateMembershipParamsType,
	create_membership_response_type
> = {
	event: create_membership,
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
