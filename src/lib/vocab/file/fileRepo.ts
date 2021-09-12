import type {Result} from '@feltcoop/felt';

import type {File, FileParams} from '$lib/vocab/file/file.js';
import type {Database} from '$lib/db/Database';

export const fileRepo = (db: Database) => ({
	create: async ({actor_id, space_id, content}: FileParams): Promise<Result<{value: File}>> => {
		const data = await db.sql<File[]>`
      INSERT INTO files (actor_id, space_id, content) VALUES (
        ${actor_id},${space_id},${content}
      ) RETURNING *
    `;
		// console.log('[db] create file', data);
		return {ok: true, value: data[0]};
	},
	// TODO maybe `FileQuery`?
	filterBySpace: async (space_id: number): Promise<Result<{value: File[]}>> => {
		console.log(`[db] preparing to query for space files: ${space_id}`);
		const data = await db.sql<File[]>`
      SELECT f.file_id, f.content, f.actor_id, f.space_id FROM files f WHERE f.space_id= ${space_id}
    `;
		console.log('[db] space files', data);
		return {ok: true, value: data};
	},
});

// TODO to associate schemas with repo methods,
// what about something like this?
// or use decorators? on classes? hmm. something else?
// repoSchemas.set(fileRepo.filterBySpace, FileFilterBySpaceResponseSchema);
