import type {Service} from '$lib/server/service';
import type {
	CreateCommunityParams,
	CreateCommunityResponseResult,
	ReadCommunityParams,
	ReadCommunityResponseResult,
	ReadCommunitiesParams,
	ReadCommunitiesResponseResult,
	UpdateCommunitySettingsParams,
	UpdateCommunitySettingsResponseResult,
} from '$lib/app/eventTypes';
import {
	CreateCommunity,
	ReadCommunities,
	ReadCommunity,
	UpdateCommunitySettings,
} from '$lib/vocab/community/community.events';
import type {CreateMembershipParams, CreateMembershipResponseResult} from '$lib/app/eventTypes';
import {CreateMembership} from '$lib/vocab/membership/membership.events';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community';

// Returns a list of community objects
export const readCommunitiesService: Service<ReadCommunitiesParams, ReadCommunitiesResponseResult> =
	{
		event: ReadCommunities,
		perform: async ({server, account_id}) => {
			const {db} = server;
			const findCommunitiesResult = await db.repos.community.filterByAccount(account_id);
			if (findCommunitiesResult.ok) {
				return {ok: true, status: 200, value: {communities: findCommunitiesResult.value}};
			} else {
				console.log('[ReadCommunities] error searching for communities');
				return {ok: false, status: 500, message: 'error searching for communities'};
			}
		},
	};

//Returns a single community object
export const readCommunityService: Service<ReadCommunityParams, ReadCommunityResponseResult> = {
	event: ReadCommunity,
	perform: async ({server, params, account_id}) => {
		const {db} = server;
		console.log('[ReadCommunity] account', account_id); // TODO logging
		console.log('[ReadCommunity] community', params.community_id);

		const findCommunityResult = await db.repos.community.findById(params.community_id);
		if (findCommunityResult.ok) {
			return {ok: true, status: 200, value: {community: findCommunityResult.value}};
		} else {
			return {
				ok: false,
				status: findCommunityResult.type === 'no_community_found' ? 404 : 500,
				message: findCommunityResult.message,
			};
		}
	},
};

//Creates a new community for an instance
// TODO think about extracting this to a `.services.` file
// that imports a generated type and declares only `perform`
export const createCommunityService: Service<CreateCommunityParams, CreateCommunityResponseResult> =
	{
		event: CreateCommunity,
		perform: async ({server, params, account_id}) => {
			console.log('created community account_id', account_id);
			// TODO validate that `account_id` is `persona_id`
			const createCommunityResult = await server.db.repos.community.create(
				params.name,
				params.persona_id,
				params.settings || toDefaultCommunitySettings(params.name),
			);
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
					console.log('[CreateCommunity] error retrieving community data');
					return {
						ok: false,
						status: 500,
						message: 'error retrieving community data',
					};
				}
			} else {
				console.log('[CreateCommunity] error creating community');
				return {
					ok: false,
					status: 500,
					message: 'error creating community',
				};
			}
		},
	};

export const updateCommunitySettingsService: Service<
	UpdateCommunitySettingsParams,
	UpdateCommunitySettingsResponseResult
> = {
	event: UpdateCommunitySettings,
	perform: async ({server, params, account_id}) => {
		// TODO authorize `account_id` declaratively
		account_id;

		const result = await server.db.repos.community.updateSettings(
			params.community_id,
			params.settings,
		);
		if (result.ok) {
			return {ok: true, status: 200, value: null};
		} else {
			return {ok: false, status: 500, message: result.message || 'unknown error'};
		}
	},
};

// TODO move to `$lib/vocab/member`
//Creates a new member relation for a community
export const createMembershipService: Service<
	CreateMembershipParams,
	CreateMembershipResponseResult
> = {
	event: CreateMembership,
	perform: async ({server, params}) => {
		console.log('[CreateMembership] creating membership', params.persona_id, params.community_id);

		const createMembershipResult = await server.db.repos.membership.create(
			params.persona_id,
			params.community_id,
		);
		if (createMembershipResult.ok) {
			return {ok: true, status: 200, value: {membership: createMembershipResult.value}};
		} else {
			console.log('[CreateMembership] error creating membership');
			return {ok: false, status: 500, message: 'error creating membership'};
		}
	},
};
