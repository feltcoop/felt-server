import type {Service} from '$lib/server/service';
import type {DeleteMembershipParams, DeleteMembershipResponseResult} from '$lib/app/eventTypes';
import {delete_membership} from '$lib/vocab/membership/membership.events';

//deletes a membership of a given persona in a given community
//TODO after front end data normalization make this use membership_id
export const deleteMembershipService: Service<
	DeleteMembershipParams,
	DeleteMembershipResponseResult
> = {
	event: delete_membership,
	perform: async ({server, params}) => {
		const {db} = server;
		const {persona_id, community_id} = params;
		console.log(
			'[delete_space] deleting membership for persona in community',
			persona_id,
			community_id,
		);
		const result = await db.repos.membership.deleteById(persona_id, community_id);
		console.log(result);
		if (!result.ok) {
			console.log('[delete_space] error removing membership: ', persona_id, community_id);
			return {ok: false, status: 500, reason: result.reason};
		}
		return {ok: true, status: 200, value: null};
	},
};
