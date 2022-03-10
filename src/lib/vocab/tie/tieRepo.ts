import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Tie} from '$lib/vocab/tie/tie';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

const log = new Logger('[tieRepo]');

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
			) RETURNING source_id,dest_id,type,created
		`;
			// log.trace('create entity', data);
			return {ok: true, value: tie[0]};
		},
		//TODO once the system is ported from a 1:1 entity:space relation to the Directory structure
		// a query like the following could be used
		filterBySpace: async (space_id: number): Promise<Result<{value: Tie[]}>> => {
			log.trace(`preparing to query for space ties: ${space_id}`);
			const ties = await db.sql<Tie[]>`
			SELECT DISTINCT source_id,dest_id,type,created 
			FROM ties t 
			JOIN (SELECT entity_id FROM entities WHERE space_id=${space_id}) as e 
			ON e.entity_id = t.source_id OR e.entity_id = t.dest_id;
			`;
			log.trace('space ties', ties);
			return {ok: true, value: ties};
		},
		filterBySourceId: async (directory_id: number): Promise<Result<{value: Tie[]}>> => {
			log.trace(`preparing to walk graph starting with directory: ${directory_id}`);
			const ties = await db.sql<Tie[]>`
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
		},
		deleteTie: async (
			source_id: number,
			dest_id: number,
			type: string,
		): Promise<Result<{value: any[]}, {type: 'deletion_error'} & ErrorResponse>> => {
			log.trace('[deleteTie]', source_id, dest_id);
			const data = await db.sql<any[]>`
				DELETE FROM ties WHERE ${source_id}=source_id AND ${dest_id}=dest_id AND ${type}=type
			`;
			if (data.count !== 1) {
				return {
					ok: false,
					type: 'deletion_error',
					message: 'failed to delete tie',
				};
			}
			return {ok: true, value: data};
		},
	} as const);
