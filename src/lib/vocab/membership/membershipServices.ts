import type {Service} from '$lib/server/service';
import type {CreateMembershipParams, CreateMembershipResponseResult} from '$lib/app/eventTypes';
import {create_membership} from '$lib/vocab/membership/membership.events';

//Creates a new member relation for a community
export const createMembershipService: Service<
	CreateMembershipParams,
	CreateMembershipResponseResult
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
