import type {Result} from '@feltcoop/felt';

import type {Entity} from '$lib/vocab/entity/entity';
import type {Database} from '$lib/db/Database';

export const entityRepo = (db: Database) => ({
	create: async (
		actor_id: number,
		space_id: number,
		content: string,
	): Promise<Result<{value: Entity}>> => {
		const data = await db.sql<Entity[]>`
			INSERT INTO entities (actor_id, space_id, content) VALUES (
				${actor_id},${space_id},${content}
			) RETURNING *
		`;
		// console.log('[db] create entity', data);
		return {ok: true, value: data[0]};
	},
	// TODO maybe `EntityQuery`?
	filterBySpace: async (space_id: number): Promise<Result<{value: Entity[]}>> => {
		console.log(`[db] preparing to query for space entities: ${space_id}`);
		const data = await db.sql<Entity[]>`
			SELECT entity_id, content, actor_id, space_id, created, updated 
			FROM entities WHERE space_id= ${space_id}
		`;
		console.log('[db] space entities', data);
		return {ok: true, value: data};
	},
});
