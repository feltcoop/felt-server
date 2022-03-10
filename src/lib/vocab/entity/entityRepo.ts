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
			log.trace('[create]', space_id, actor_id);
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
			log.trace('[filterBySpace]', space_id);
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
			log.trace('[updateEntityData]', entity_id);
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
		//This function is a idempotent soft delete, that leaves behind a Tombstone entity per Activity-Streams spec
		deleteById: async (
			entity_id: number,
		): Promise<Result<{value: any[]}, {type: 'deletion_error'} & ErrorResponse>> => {
			log.trace('[deleteById]', entity_id);
			const data = await db.sql<any[]>`
				UPDATE entities
				SET data = jsonb_build_object('type','Tombstone','formerType',data->'type','deleted',NOW())
				WHERE entity_id=${entity_id} AND data->>'type' != 'Tombstone';
			`;
			if (data.count !== 1) {
				return {
					ok: false,
					type: 'deletion_error',
					message: 'failed to delete entity',
				};
			}
			return {ok: true, value: data};
		},
		//This function actually deletes the record in the DB
		hardDeleteById: async (
			entity_id: number,
		): Promise<Result<{value: any[]}, {type: 'deletion_error'} & ErrorResponse>> => {
			log.trace('[hardDeleteById]', entity_id);
			const data = await db.sql<any[]>`
				DELETE FROM entities WHERE ${entity_id}=entity_id
			`;
			if (data.count !== 1) {
				return {
					ok: false,
					type: 'deletion_error',
					message: 'failed to hard delete entity',
				};
			}
			return {ok: true, value: data};
		},
	} as const);
