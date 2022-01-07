import type {Service} from '$lib/server/service';
import type {DeleteMembershipParams, DeleteMembershipResponseResult} from '$lib/app/eventTypes';
import {DeleteMembership} from '$lib/vocab/membership/membership.events';

//deletes a membership of a given persona in a given community
//TODO after front end data normalization make this use membership_id
export const deleteMembershipService: Service<
	DeleteMembershipParams,
	DeleteMembershipResponseResult
> = {
	event: DeleteMembership,
	perform: async ({server, params}) => {
		const {db} = server;
		const {persona_id, community_id} = params;
		console.log(
			'[DeleteSpace] deleting membership for persona in community',
			persona_id,
			community_id,
		);
		const result = await db.repos.membership.deleteById(persona_id, community_id);
		console.log(result);
		if (!result.ok) {
			console.log('[DeleteSpace] error removing membership: ', persona_id, community_id);
			return {ok: false, status: 500, message: result.message};
		}
		return {ok: true, status: 200, value: null};
	},
};
