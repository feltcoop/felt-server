import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Entity} from '$lib/vocab/entity/entity';
import type {EntityData} from '$lib/vocab/entity/entityData';
import type {RowList} from 'postgres';

const log = new Logger(gray('[') + blue('EntityRepo') + gray(']'));

export class EntityRepo extends PostgresRepo {
	async create(
		actor_id: number,
		data: EntityData,
		space_id?: number,
	): Promise<Result<{value: Entity}>> {
		log.trace('[create]', space_id, actor_id);
		let entity: RowList<Entity[]>;
		if (space_id) {
			entity = await this.db.sql<Entity[]>`
			INSERT INTO entities (actor_id, space_id, data) VALUES (
				${actor_id},${space_id},${this.db.sql.json(data)}
			) RETURNING *
		`;
		} else {
			entity = await this.db.sql<Entity[]>`
			INSERT INTO entities (actor_id, data) VALUES (
				${actor_id},${this.db.sql.json(data)}
			) RETURNING *
		`;
		}
		// log.trace('create entity', data);
		return {ok: true, value: entity[0]};
	}

	// TODO maybe `EntityQuery`?
	async filterBySpace(space_id: number): Promise<Result<{value: Entity[]}>> {
		log.trace('[filterBySpace]', space_id);
		const entities = await this.db.sql<Entity[]>`
			SELECT entity_id, data, actor_id, space_id, created, updated 
			FROM entities WHERE space_id= ${space_id}
			ORDER BY created ASC
		`;
		log.trace('space entity count:', entities.length);
		return {ok: true, value: entities};
	}

	async updateEntityData(entity_id: number, data: EntityData): Promise<Result<{value: Entity}>> {
		log.trace('[updateEntityData]', entity_id);
		const result = await this.db.sql<Entity[]>`
			UPDATE entities SET data=${this.db.sql.json(data)}, updated=NOW()
			WHERE entity_id= ${entity_id}
			RETURNING *
		`;
		if (!result.count) {
			return {ok: false};
		}
		return {ok: true, value: result[0]};
	}

	//This function is a idempotent soft delete, that leaves behind a Tombstone entity per Activity-Streams spec
	async softDeleteById(entity_id: number): Promise<Result<object>> {
		log.trace('[deleteById]', entity_id);
		const data = await this.db.sql<any[]>`
			UPDATE entities
			SET data = jsonb_build_object('type','Tombstone','formerType',data->>'type','deleted',NOW())
			WHERE entity_id=${entity_id} AND data->>'type' != 'Tombstone';
		`;
		if (!data.count) {
			return {ok: false};
		}
		return {ok: true};
	}

	//This function actually deletes the record in the DB
	async hardDeleteById(entity_id: number): Promise<Result<object>> {
		log.trace('[hardDeleteById]', entity_id);
		const data = await this.db.sql<any[]>`
			DELETE FROM entities WHERE ${entity_id}=entity_id
		`;
		if (!data.count) {
			return {ok: false};
		}
		return {ok: true};
	}
}
