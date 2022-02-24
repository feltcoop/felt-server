import type {Result} from '@feltcoop/felt';

import type {Tie} from '$lib/vocab/tie/tie';
import type {Database} from '$lib/db/Database';

export const tieRepo = (db: Database) =>
	({
		create: async (
			source_id: number,
			dest_id: number,
			type: string,
		): Promise<Result<{value: Tie}>> => {
			const tie = await db.sql<Tie[]>`
			INSERT INTO ties (source_id, dest_id, type) VALUES (
				${source_id},${dest_id},${type}
			) RETURNING *
		`;
			// console.log('[db] create entity', data);
			return {ok: true, value: tie[0]};
		},
	} as const);
