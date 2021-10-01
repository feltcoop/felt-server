import type {Result} from '@feltcoop/felt';

import type {Membership} from '$lib/vocab/membership/membership.js';
import type {Database} from '$lib/db/Database';
import type {create_membership_params_type} from '$lib/ui/events';

export const membershipRepo = (db: Database) => ({
	create: async ({
		persona_id,
		community_id,
	}: create_membership_params_type): Promise<Result<{value: Membership}>> => {
		const data = await db.sql<Membership[]>`
      INSERT INTO memberships (persona_id, community_id) VALUES (
        ${persona_id},${community_id}
      ) RETURNING *
    `;
		console.log('[db] created membership', data);
		return {ok: true, value: data[0]};
	},
});
