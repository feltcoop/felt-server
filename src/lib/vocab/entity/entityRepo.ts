import type {Result} from '@feltcoop/felt';

import type {Entity} from '$lib/vocab/entity/entity';
import type {Database} from '$lib/db/Database';
import type {EntityData} from './entityData';

export const entityRepo = (db: Database) => ({
	create: async (
		actor_id: number,
		space_id: number,
		data: EntityData,
	): Promise<Result<{value: Entity}>> => {
		const entity = await db.sql<Entity[]>`
			INSERT INTO entities (actor_id, space_id, data) VALUES (
				${actor_id},${space_id},${db.sql.json(data)}
			) RETURNING *
		`;
		// console.log('[db] create entity', data);
		return {ok: true, value: entity[0]};
	},
	// TODO maybe `EntityQuery`?
	filterBySpace: async (space_id: number): Promise<Result<{value: Entity[]}>> => {
		console.log(`[db] preparing to query for space entities: ${space_id}`);
		const entities = await db.sql<Entity[]>`
			SELECT entity_id, data, actor_id, space_id, created, updated 
			FROM entities WHERE space_id= ${space_id}
		`;
		console.log('[db] space entities', entities);
		return {ok: true, value: entities};
	},
});
