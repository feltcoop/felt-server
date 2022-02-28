import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import type {Entity} from '$lib/vocab/entity/entity';
import type {Database} from '$lib/db/Database';
import type {EntityData} from '$lib/vocab/entity/entityData';
import type {ErrorResponse} from '$lib/util/error';

const log = new Logger(gray('[') + blue('entityRepo') + gray(']'));

export const entityRepo = (db: Database) =>
	({
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
			// log.trace('create entity', data);
			return {ok: true, value: entity[0]};
		},
		// TODO maybe `EntityQuery`?
		filterBySpace: async (space_id: number): Promise<Result<{value: Entity[]}>> => {
			log.trace(`[filterBySpace] ${space_id}`);
			const entities = await db.sql<Entity[]>`
				SELECT entity_id, data, actor_id, space_id, created, updated 
				FROM entities WHERE space_id= ${space_id}
				ORDER BY created ASC
			`;
			log.trace('space entities', entities);
			return {ok: true, value: entities};
		},
		updateEntityData: async (
			entity_id: number,
			data: EntityData,
		): Promise<Result<{value: Entity}, ErrorResponse>> => {
			log.trace(`[updateEntityData] ${entity_id}`);
			const result = await db.sql<Entity[]>`
				UPDATE entities SET data=${db.sql.json(data)}, updated=NOW()
				WHERE entity_id= ${entity_id}
				RETURNING *
			`;
			if (!result.count) {
				return {ok: false, message: 'failed to update entity data'};
			}
			return {ok: true, value: result[0]};
		},
	} as const);
