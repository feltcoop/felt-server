import type {Service} from '$lib/server/service';
import type {
	CreateMembershipParams,
	CreateMembershipResponseResult,
	DeleteMembershipParams,
	DeleteMembershipResponseResult,
} from '$lib/app/eventTypes';
import {CreateMembership, DeleteMembership} from '$lib/vocab/membership/membership.events';

//Creates a new member relation for a community
export const createMembershipService: Service<
	CreateMembershipParams,
	CreateMembershipResponseResult
> = {
	event: CreateMembership,
	perform: async ({repos, params}) => {
		console.log('[CreateMembership] creating membership', params.persona_id, params.community_id);

		// Personal communities disallow memberships as a hard rule.
		const communityResult = await repos.community.findById(params.community_id);
		if (!communityResult.ok) {
			return {ok: false, status: 400, message: 'community not found'};
		}
		const community = communityResult.value;
		if (community.type === 'personal') {
			return {ok: false, status: 403, message: 'personal communities disallow memberships'};
		}

		// TODO test what happens if the persona doesn't exist

		const createMembershipResult = await repos.membership.create(
			params.persona_id,
			params.community_id,
		);
		if (createMembershipResult.ok) {
			return {ok: true, status: 200, value: {membership: createMembershipResult.value}};
		}
		console.log('[CreateMembership] error creating membership');
		return {ok: false, status: 500, message: 'error creating membership'};
	},
};

//deletes a membership of a given persona in a given community
//TODO after front end data normalization make this use membership_id
export const deleteMembershipService: Service<
	DeleteMembershipParams,
	DeleteMembershipResponseResult
> = {
	event: DeleteMembership,
	perform: async ({repos, params}) => {
		const {persona_id, community_id} = params;
		console.log(
			'[DeleteSpace] deleting membership for persona in community',
			persona_id,
			community_id,
		);
		const [personaResult, communityResult] = await Promise.all([
			repos.persona.findById(persona_id),
			repos.community.findById(community_id),
		]);
		if (!personaResult.ok) {
			return {ok: false, status: 404, message: personaResult.message};
		}
		if (!communityResult.ok) {
			return {ok: false, status: 404, message: communityResult.message};
		}
		if (communityResult.value.type === 'personal') {
			return {ok: false, status: 405, message: 'cannot leave a personal community'};
		}
		if (
			personaResult.value.type === 'community' &&
			personaResult.value.community_id === community_id
		) {
			return {ok: false, status: 405, message: 'community persona cannot leave its community'};
		}

		const result = await repos.membership.deleteById(persona_id, community_id);
		console.log(result);
		if (!result.ok) {
			console.log('[DeleteSpace] error removing membership: ', persona_id, community_id);
			return {ok: false, status: 500, message: result.message};
		}
		return {ok: true, status: 200, value: null};
	},
};
