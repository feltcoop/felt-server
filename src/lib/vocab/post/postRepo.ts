import type {Result} from '@feltcoop/felt';

import type {Post} from '$lib/vocab/post/post.js';
import type {Database} from '$lib/db/Database';

export const postRepo = (db: Database) => ({
	insert: async (
		actor_id: number,
		space_id: string,
		content: string,
	): Promise<Result<{value: Post}>> => {
		const data = await db.sql<Post[]>`
      INSERT INTO posts (actor_id, space_id, content) VALUES (
        ${actor_id},${space_id},${content}
      ) RETURNING *
    `;
		console.log('[db] create post', data);
		return {ok: true, value: data[0]};
	},
	filter_by_space: async (space_id: string): Promise<Result<{value: Post[]}>> => {
		console.log(`[db] preparing to query for space posts: ${space_id}`);
		const data = await db.sql<Post[]>`
      SELECT p.post_id, p.content, p.actor_id, p.space_id FROM posts p WHERE p.space_id= ${space_id}
    `;
		console.log('[db] space posts', data);
		return {ok: true, value: data};
	},
});
