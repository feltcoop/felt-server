import type {Result} from '@feltcoop/felt';

import type {Membership, MembershipParams} from '$lib/vocab/membership/membership.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

export const membershipRepo = (db: Database) => ({
	// TODO: this is a hack to stub out "members" for inviting to a Community.
	//This should use a community_id to filter or something
	getAll: async (): Promise<Result<{value: Membership[]}, ErrorResponse>> => {
		const data = await db.sql<Membership[]>`
      select persona_id, name from personas
    `;
		return {ok: true, value: data};
	},
	create: async ({persona_id, community_id}: MembershipParams): Promise<Result<{value: Membership}>> => {
		const data = await db.sql<Membership[]>`
      INSERT INTO membership (persona_id, community_id) VALUES (
        ${persona_id},${community_id}
      ) RETURNING *			
    `;
		console.log('[db] created membership', data);
		return {ok: true, value: data[0]};
	},
});
