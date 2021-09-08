import type {Result} from '@feltcoop/felt';

import type {Member} from '$lib/vocab/member/member.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

export const memberRepo = (db: Database) => ({
	// TODO: this is a hack to stub out "members" for inviting to a Community.
	//This should use a community_id to filter or something
	get_all: async (): Promise<Result<{value: Member[]}, ErrorResponse>> => {
		const data = await db.sql<Member[]>`
      select persona_id, name from personas
    `;
		return {ok: true, value: data};
	},
	create: async (persona_id: number, community_id: number): Promise<Result<{value: Member}>> => {
		const data = await db.sql<Member[]>`
      INSERT INTO persona_communities (persona_id, community_id) VALUES (
        ${persona_id},${community_id}
      ) RETURNING *			
    `;
		console.log('[db] created persona_communities', data);
		return {ok: true, value: data[0]};
	},
});
