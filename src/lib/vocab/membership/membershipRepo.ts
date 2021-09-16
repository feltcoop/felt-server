import type {Result} from '@feltcoop/felt';

import type {Membership, MembershipParams} from '$lib/vocab/membership/membership.js';
import type {Database} from '$lib/db/Database';

export const membershipRepo = (db: Database) => ({
	create: async ({
		persona_id,
		community_id,
	}: MembershipParams): Promise<Result<{value: Membership}>> => {
		const data = await db.sql<Membership[]>`
      INSERT INTO memberships (persona_id, community_id) VALUES (
        ${persona_id},${community_id}
      ) RETURNING *			
    `;
		console.log('[db] created membership', data);
		return {ok: true, value: data[0]};
	},
});
