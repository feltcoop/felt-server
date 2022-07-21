import {NOT_OK, OK, type Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Entity} from '$lib/vocab/entity/entity';
import type {EntityData} from '$lib/vocab/entity/entityData';
import type {ErrorResponse} from '$lib/util/error';

const log = new Logger(gray('[') + blue('EntityRepo') + gray(']'));

export class EntityRepo extends PostgresRepo {
	async create(persona_id: number, data: EntityData): Promise<Result<{value: Entity}>> {
		log.trace('[createEntity]', persona_id);
		const entity = await this.db.sql<Entity[]>`
			INSERT INTO entities (persona_id, data) VALUES (
				${persona_id},${this.db.sql.json(data as any)}
			) RETURNING *
		`;
		// log.trace('create entity', data);
		return {ok: true, value: entity[0]};
	}

	// TODO maybe `EntityQuery`?
	async filterByIds(entityIds: number[]): Promise<Result<{value: Entity[]}, ErrorResponse>> {
		if (entityIds.length === 0) return {ok: true, value: []};
		log.trace('[findBySet]', entityIds);
		const entities = await this.db.sql<Entity[]>`
			SELECT entity_id, data, persona_id, created, updated 
			FROM entities WHERE entity_id IN ${this.db.sql(entityIds)}
			ORDER BY entity_id DESC
		`;
		log.trace('filterByIds entity count:', entities.length);
		if (entities.count !== entityIds.length) {
			return {
				ok: false,
				message: `expected ${entityIds.length} entities but only found ${entities.count}`,
			};
		}
		return {ok: true, value: entities};
	}

	async updateEntityData(
		entity_id: number,
		data: EntityData | null,
	): Promise<Result<{value: Entity}>> {
		log.trace('[updateEntityData]', entity_id);
		const _data = await this.db.sql<Entity[]>`
			UPDATE entities SET ${
				data ? this.db.sql`data=${this.db.sql.json(data as any)},` : this.db.sql``
			} updated=NOW()
			WHERE entity_id= ${entity_id} AND data->>'type' != 'Tombstone'
			RETURNING *
		`;
		if (!_data.count) return NOT_OK;
		return {ok: true, value: _data[0]};
	}

	//This function is an idempotent soft delete, that leaves behind a Tombstone entity per Activity-Streams spec
	async eraseByIds(entityIds: number[]): Promise<Result<{value: Entity[]}>> {
		log.trace('[eraseById]', entityIds);
		const data = await this.db.sql<any[]>`
			UPDATE entities
			SET data = jsonb_build_object('type','Tombstone','formerType',data->>'type','deleted',NOW())
			WHERE entity_id IN ${this.db.sql(entityIds)} AND data->>'type' != 'Tombstone'
			RETURNING *;
		`;
		if (!data.count) return NOT_OK;
		return {ok: true, value: data};
	}

	//This function actually deletes the records in the DB
	async deleteByIds(entityIds: number[]): Promise<Result<object>> {
		log.trace('[deleteByIds]', entityIds);
		const data = await this.db.sql<any[]>`
			DELETE FROM entities WHERE entity_id IN ${this.db.sql(entityIds)}
		`;
		if (!data.count) return NOT_OK;
		if (data.count !== entityIds.length) return NOT_OK;
		return OK;
	}

	//This function finds all non-directory entities with no ties pointing to them & returns an array of their ids
	async findOrphanedEntities(): Promise<Result<{value: number[]}>> {
		const data = await this.db.sql<Entity[]>`
			SELECT entity_id FROM entities e
			LEFT JOIN ties t
			ON e.entity_id = t.dest_id
			WHERE e.data->>'space_id' IS NULL AND t.dest_id IS NULL;
		`;
		return {ok: true, value: data.flatMap((e) => e.entity_id)};
	}
}
