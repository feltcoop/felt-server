import {NOT_OK, OK, type Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Tie} from '$lib/vocab/tie/tie';

const log = new Logger('[TieRepo]');

export class TieRepo extends PostgresRepo {
	async create(source_id: number, dest_id: number, type: string): Promise<Result<{value: Tie}>> {
		const tie = await this.db.sql<Tie[]>`
			INSERT INTO ties (source_id, dest_id, type) VALUES (
				${source_id},${dest_id},${type}
			) RETURNING source_id,dest_id,type,created
		`;
		// log.trace('create entity', data);
		return {ok: true, value: tie[0]};
	}

	//TODO once the system is ported from a 1:1 entity:space relation to the Directory structure
	// a query like the following could be used
	async filterBySpace(space_id: number): Promise<Result<{value: Tie[]}>> {
		log.trace(`preparing to query for space ties: ${space_id}`);
		const ties = await this.db.sql<Tie[]>`
			SELECT DISTINCT source_id,dest_id,type,created 
			FROM ties t 
			JOIN (SELECT entity_id FROM entities WHERE space_id=${space_id}) as e 
			ON e.entity_id = t.source_id OR e.entity_id = t.dest_id;
		`;
		log.trace('space ties', ties);
		return {ok: true, value: ties};
	}

	async filterBySourceId(directory_id: number): Promise<Result<{value: Tie[]}>> {
		log.trace(`preparing to walk graph starting with directory: ${directory_id}`);
		const ties = await this.db.sql<Tie[]>`
			WITH RECURSIVE paths (source_id, dest_id, type, created, path) AS (
				SELECT t.source_id, t.dest_id, t.type, t.created, ARRAY[t.source_id, t.dest_id]
					FROM ties t WHERE source_id=${directory_id}
				UNION ALL
					SELECT t.source_id, t.dest_id, t.type,t.created, p.path || ARRAY[t.dest_id]
					FROM paths p
					JOIN ties t
					ON p.dest_id = t.source_id AND t.dest_id != ALL(p.path)
			)
			SELECT DISTINCT source_id, dest_id, type, created FROM paths;
		`;
		log.trace('directory ties', ties);
		return {ok: true, value: ties};
	}

	async deleteTie(source_id: number, dest_id: number, type: string): Promise<Result<object>> {
		log.trace('[deleteTie]', source_id, dest_id);
		const data = await this.db.sql<any[]>`
			DELETE FROM ties WHERE ${source_id}=source_id AND ${dest_id}=dest_id AND ${type}=type
		`;
		if (!data.count) {
			return NOT_OK;
		}
		return OK;
	}
}
