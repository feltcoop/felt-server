import type {Result} from '@feltcoop/felt';

import type {Space} from '$lib/vocab/space/space.js';
import type {Database} from '$lib/db/Database';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import type {ErrorResponse} from '$lib/util/error';
import type {Community} from '$lib/vocab/community/community';

export const spaceRepo = (db: Database) => ({
	findById: async (
		space_id: number,
	): Promise<Result<{value: Space}, {type: 'no_space_found'} & ErrorResponse>> => {
		console.log(`[db] preparing to query for space id: ${space_id}`);
		const data = await db.sql<Space[]>`
			SELECT space_id, name, url, media_type, content, updated, created, community_id
			FROM spaces WHERE space_id = ${space_id}
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
	filterByCommunity: async (community_id: number): Promise<Result<{value: Space[]}>> => {
		console.log(`[spaceRepo] preparing to query for community spaces: ${community_id}`);
		const data = await db.sql<Space[]>`
			SELECT space_id, name, url, media_type, content, updated, created, community_id
			FROM spaces WHERE community_id=${community_id}
		`;
		// console.log('[db] spaces data', data);
		return {ok: true, value: data};
	},
	findByCommunityUrl: async (
		community_id: number,
		url: string,
	): Promise<Result<{value: Space | undefined}>> => {
		console.log(
			`[spaceRepo] preparing to query for community space by url: ${community_id} ${url}`,
		);
		const data = await db.sql<Space[]>`
			SELECT space_id, name, url, media_type, content, updated, created, community_id
			FROM spaces WHERE community_id=${community_id} AND url=${url}
		`;
		console.log('[spaceRepo] space data', data);
		return {ok: true, value: data[0]};
	},
	create: async (
		name: string,
		content: string,
		media_type: string,
		url: string,
		community_id: number,
	): Promise<Result<{value: Space}>> => {
		const data = await db.sql<Space[]>`
			INSERT INTO spaces (name, url, media_type, content, community_id) VALUES (
				${name},${url},${media_type},${content},${community_id}
			) RETURNING *
		`;
		// console.log('[db] created communitySpace', communitySpace);
		return {ok: true, value: data[0]};
	},
	createDefaultSpaces: async (
		community: Community,
	): Promise<Result<{value: Space[]}, ErrorResponse>> => {
		const spaces: Space[] = [];
		for (const params of toDefaultSpaces(community)) {
			const result = await db.repos.space.create(
				params.name,
				params.content,
				params.media_type,
				params.url,
				params.community_id,
			);
			if (!result.ok) return {ok: false, reason: 'Failed to create default spaces for community.'};
			spaces.push(result.value);
		}
		// console.log('[db] created default spaces', community_id, spaces);
		return {ok: true, value: spaces};
	},
	deleteById: async (
		space_id: number,
	): Promise<Result<{value: any[]}, {type: 'deletion_error'} & ErrorResponse>> => {
		const data = await db.sql<any[]>`
			DELETE FROM spaces WHERE ${space_id}=space_id
		`;

		if (data.count !== 1) {
			return {
				ok: false,
				type: 'deletion_error',
				reason: `There was an issue deleting space: ${space_id}`,
			};
		}

		return {ok: true, value: data};
	},
});
