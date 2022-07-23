import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {ServiceByName} from '$lib/app/eventTypes';
import {
	CreateCommunity,
	ReadCommunities,
	ReadCommunity,
	UpdateCommunitySettings,
	DeleteCommunity,
} from '$lib/vocab/community/communityEvents';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {createDefaultSpaces} from '$lib/vocab/space/spaceServices';

const log = new Logger(gray('[') + blue('communityServices') + gray(']'));

const BLOCKLIST = new Set(['docs', 'schemas', 'admin', 'about', 'blog']);

// Returns a list of community objects
export const ReadCommunitiesService: ServiceByName['ReadCommunities'] = {
	event: ReadCommunities,
	perform: async ({repos, account_id}) => {
		const findCommunitiesResult = await repos.community.filterByAccount(account_id);
		if (!findCommunitiesResult.ok) {
			log.trace('[ReadCommunities] error searching for communities');
			return {
				ok: false,
				status: 500,
				message: 'error searching for communities',
			};
		}
		return {
			ok: true,
			status: 200,
			value: {communities: findCommunitiesResult.value},
		};
	},
};

//Returns a single community object
export const ReadCommunityService: ServiceByName['ReadCommunity'] = {
	event: ReadCommunity,
	perform: async ({repos, params, account_id}) => {
		log.trace('[ReadCommunity] account', account_id); // TODO logging
		log.trace('[ReadCommunity] community', params.community_id);

		const findCommunityResult = await repos.community.findById(params.community_id);
		if (!findCommunityResult.ok) {
			return {
				ok: false,
				status: 404,
				message: 'no community found',
			};
		}
		return {
			ok: true,
			status: 200,
			value: {community: findCommunityResult.value},
		};
	},
};

//Creates a new community for an instance
// TODO think about extracting this to a `.services.` file
// that imports a generated type and declares only `perform`
export const CreateCommunityService: ServiceByName['CreateCommunity'] = {
	event: CreateCommunity,
	perform: (serviceRequest) =>
		serviceRequest.transact(async (repos) => {
			const {params, account_id} = serviceRequest;
			log.trace('creating community account_id', account_id);
			// run name through block list
			if (BLOCKLIST.has(params.name)) {
				return {ok: false, status: 409, message: 'a community with that name is not allowed'};
			}

			// Check for duplicate community names.
			const findCommunityResult = await repos.community.findByName(params.name);
			if (!findCommunityResult.ok) {
				return {ok: false, status: 500, message: 'failed to lookup existing community by name'};
			}
			if (findCommunityResult.value) {
				return {ok: false, status: 409, message: 'a community with that name already exists'};
			}

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
			const community = createCommunityResult.value;

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

			const createDefaultSpaceResult = await createDefaultSpaces(
				serviceRequest,
				params.persona_id,
				community,
			);
			if (!createDefaultSpaceResult.ok) {
				log.trace('[CreateCommunity] error creating community default spaces');
				return {
					ok: false,
					status: 500,
					message: 'error creating community default spaces',
				};
			}
			const spaces = createDefaultSpaceResult.value;

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
			};
		}),
};

export const UpdateCommunitySettingsService: ServiceByName['UpdateCommunitySettings'] = {
	event: UpdateCommunitySettings,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const result = await repos.community.updateSettings(params.community_id, params.settings);
			if (!result.ok) {
				return {ok: false, status: 500, message: 'failed to update community settings'};
			}
			return {ok: true, status: 200, value: null};
		}),
};

//TODO don't let users delete their home community
export const DeleteCommunityService: ServiceByName['DeleteCommunity'] = {
	event: DeleteCommunity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const communityResult = await repos.community.findById(params.community_id);
			if (!communityResult.ok) {
				return {
					ok: false,
					status: 404,
					message: 'no community found',
				};
			}
			if (communityResult.value.type === 'personal') {
				return {
					ok: false,
					status: 405,
					message: 'cannot delete personal community',
				};
			}
			const deleteResult = await repos.community.deleteById(params.community_id);
			if (!deleteResult.ok) {
				return {ok: false, status: 500, message: 'failed to delete community'};
			}
			return {ok: true, status: 200, value: null};
		}),
};
