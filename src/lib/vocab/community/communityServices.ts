import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

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
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';

const log = new Logger(gray('[') + blue('communityServices') + gray(']'));

// Returns a list of community objects
export const readCommunitiesService: Service<ReadCommunitiesParams, ReadCommunitiesResponseResult> =
	{
		event: ReadCommunities,
		perform: async ({repos, account_id}) => {
			const findCommunitiesResult = await repos.community.filterByAccount(account_id);
			if (findCommunitiesResult.ok) {
				return {ok: true, status: 200, value: {communities: findCommunitiesResult.value}};
			}
			log.trace('[ReadCommunities] error searching for communities');
			return {ok: false, status: 500, message: 'error searching for communities'};
		},
	};

//Returns a single community object
export const readCommunityService: Service<ReadCommunityParams, ReadCommunityResponseResult> = {
	event: ReadCommunity,
	perform: async ({repos, params, account_id}) => {
		log.trace('[ReadCommunity] account', account_id); // TODO logging
		log.trace('[ReadCommunity] community', params.community_id);

		const findCommunityResult = await repos.community.findById(params.community_id);
		if (findCommunityResult.ok) {
			return {ok: true, status: 200, value: {community: findCommunityResult.value}};
		}
		return {
			ok: false,
			status: findCommunityResult.type === 'no_community_found' ? 404 : 500,
			message: findCommunityResult.message,
		};
	},
};

//Creates a new community for an instance
// TODO think about extracting this to a `.services.` file
// that imports a generated type and declares only `perform`
export const createCommunityService: Service<CreateCommunityParams, CreateCommunityResponseResult> =
	{
		event: CreateCommunity,
		perform: async ({repos, params, account_id}) => {
			log.trace('created community account_id', account_id);
			// TODO validate that `account_id` is `persona_id`
			const createCommunityResult = await repos.community.create(
				'standard',
				params.name,
				params.settings || toDefaultCommunitySettings(params.name),
				params.persona_id,
			);
			log.trace('[CreateCommunity] result', createCommunityResult);
			if (createCommunityResult.ok) {
				// TODO optimize this to return `createCommunityResult.value` instead of making another db call,
				// needs to populate members, but we probably want to normalize the data, returning only ids
				const communityData = await repos.community.filterByAccount(account_id);
				if (communityData.ok) {
					const {
						community: {community_id},
						spaces,
					} = createCommunityResult.value;
					log.trace('[CreateCommunity] community_id', community_id);
					log.trace('[CreateCommunity] communityData', communityData);
					return {
						ok: true,
						status: 200,
						value: {
							community: communityData.value.find((c) => c.community_id === community_id)!,
							spaces,
						},
					}; // TODO API types
				}
				log.trace('[CreateCommunity] error retrieving community data');
				return {
					ok: false,
					status: 500,
					message: 'error retrieving community data',
				};
			}
			log.trace('[CreateCommunity] error creating community');
			return {
				ok: false,
				status: 500,
				message: 'error creating community',
			};
		},
	};

export const updateCommunitySettingsService: Service<
	UpdateCommunitySettingsParams,
	UpdateCommunitySettingsResponseResult
> = {
	event: UpdateCommunitySettings,
	perform: async ({repos, params}) => {
		const result = await repos.community.updateSettings(params.community_id, params.settings);
		if (result.ok) {
			return {ok: true, status: 200, value: null};
		}
		return {ok: false, status: 500, message: result.message || 'unknown error'};
	},
};
