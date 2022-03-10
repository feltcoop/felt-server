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
			log.trace('creating community account_id', account_id);
			// TODO validate that `account_id` is `persona_id`
			const createCommunityResult = await repos.community.create(
				'standard',
				params.name,
				params.settings || toDefaultCommunitySettings(params.name),
			);
			log.trace('createCommunityResult', createCommunityResult);

			if (!createCommunityResult.ok) {
				log.trace('[CreateCommunity] error creating community');
				return {
					ok: false,
					status: 500,
					message: 'error creating community',
				};
			}
			const {community, spaces} = createCommunityResult.value;
			//TODO maybe trim down returned Persona data?
			const communityPersonaResult = await repos.persona.createCommunityPersona(
				community.name,
				community.community_id,
			);
			if (!communityPersonaResult.ok) {
				log.trace('[CreateCommunity] error creating community persona');
				return {
					ok: false,
					status: 500,
					message: 'error creating community persona',
				};
			}
			const communityPersona = communityPersonaResult.value;
			const communityPersonaMembershipResult = await repos.membership.create(
				communityPersona.persona_id,
				community.community_id,
			);

			if (!communityPersonaMembershipResult.ok) {
				log.trace('[CreateCommunity] error creating community persona membership');
				return {
					ok: false,
					status: 500,
					message: 'error creating community persona membership',
				};
			}
			const creatorMembershipResult = await repos.membership.create(
				params.persona_id,
				community.community_id,
			);
			if (!creatorMembershipResult.ok) {
				log.trace('[CreateCommunity] error making creator membership');
				return {
					ok: false,
					status: 500,
					message: 'error making creator membership',
				};
			}
			return {
				ok: true,
				status: 200,
				value: {
					community,
					spaces,
					communityPersona,
					memberships: [communityPersonaMembershipResult.value, creatorMembershipResult.value],
				},
			}; // TODO API types
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
