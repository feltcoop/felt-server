import type {Result} from '@feltcoop/felt';

import type {Space, SpaceParams} from '$lib/vocab/space/space.js';
import type {Database} from '$lib/db/Database';
import {to_default_spaces} from '$lib/vocab/space/default_spaces';
import type {ErrorResponse} from '$lib/util/error';

export const spaceRepo = (db: Database) => ({
	find_by_id: async (
		space_id: string,
	): Promise<Result<{value: Space}, {type: 'no_space_found'} & ErrorResponse>> => {
		console.log(`[db] preparing to query for space id: ${space_id}`);
		const data = await db.sql<Space[]>`
      select space_id, name, url, media_type, content from spaces where space_id = ${space_id}
    `;
		console.log('[db] space data', data);
		if (data.length) {
			return {ok: true, value: data[0]};
		}
		return {
			ok: false,
			type: 'no_space_found',
			reason: `No space found with id: ${space_id}`,
		};
	},
	filter_by_community: async (community_id: string): Promise<Result<{value: Space[]}>> => {
		console.log(`[db] preparing to query for community spaces: ${community_id}`);
		const data = await db.sql<Space[]>`
      SELECT s.space_id, s.name, s.url, s.media_type, s.content FROM spaces s JOIN community_spaces cs ON s.space_id=cs.space_id AND cs.community_id= ${community_id}
    `;
		console.log('[db] spaces data', data);
		return {ok: true, value: data};
	},
	insert: async (params: SpaceParams): Promise<Result<{value: Space}>> => {
		const {name, content, media_type, url} = params;
		const data = await db.sql<Space[]>`
      INSERT INTO spaces (name, url, media_type, content) VALUES (
        ${name},${url},${media_type},${content}
      ) RETURNING *
    `;
		console.log('[db] created space', data);
		const space_id: number = data[0].space_id;
		console.log('[db] creating community space', params.community_id, space_id);
		// TODO more robust error handling or condense into single query
		const association = await db.sql<any>`
      INSERT INTO community_spaces (space_id, community_id) VALUES (
        ${space_id},${params.community_id}
      )
    `;
		console.log('[db] created community_space', association);
		return {ok: true, value: data[0]};
	},
	insert_default_spaces: async (
		community_id: number,
	): Promise<Result<{value: Space[]}, ErrorResponse>> => {
		const spaces: Space[] = [];
		for (const space_params of to_default_spaces(community_id)) {
			const result = await db.repos.space.insert(space_params);
			if (!result.ok) return {ok: false, reason: 'Failed to create default spaces for community.'};
			spaces.push(result.value);
		}
		console.log('[db] created default spaces', community_id, spaces);
		return {ok: true, value: spaces};
	},
});
