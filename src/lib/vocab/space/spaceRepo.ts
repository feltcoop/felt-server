import type {Result} from '@feltcoop/felt';

import type {Space} from '$lib/vocab/space/space.js';
import type {Database} from '$lib/db/Database';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import type {ErrorResponse} from '$lib/util/error';
import type {Community} from '$lib/vocab/community/community';
import type {ViewData} from '$lib/vocab/view/view';

export const spaceRepo = (db: Database) =>
	({
		findById: async (
			space_id: number,
		): Promise<Result<{value: Space}, {type: 'no_space_found'} & ErrorResponse>> => {
			console.log(`[db] preparing to query for space id: ${space_id}`);
			const data = await db.sql<Space[]>`
				SELECT space_id, name, url, view, updated, created, community_id
				FROM spaces WHERE space_id = ${space_id}
			`;
			console.log('[db] space data', data);
			if (data.length) {
				return {ok: true, value: data[0]};
			}
			return {
				ok: false,
				type: 'no_space_found',
				message: 'no space found',
			};
		},
		filterByAccount: async (
			account_id: number,
		): Promise<Result<{value: Space[]}, ErrorResponse>> => {
			console.log(`[spaceRepo] preparing to query for community spaces by account: ${account_id}`);
			const data = await db.sql<Space[]>`
				SELECT s.space_id, s.name, s.url, s.view, s.updated, s.created, s.community_id
				FROM spaces s JOIN (
					SELECT DISTINCT m.community_id FROM personas p JOIN memberships m ON p.persona_id=m.persona_id AND p.account_id = ${account_id}
				) apc
				ON s.community_id=apc.community_id;
			`;
			return {ok: true, value: data};
		},
		filterByCommunity: async (community_id: number): Promise<Result<{value: Space[]}>> => {
			console.log(`[spaceRepo] preparing to query for community spaces: ${community_id}`);
			const data = await db.sql<Space[]>`
				SELECT space_id, name, url, view, updated, created, community_id
				FROM spaces WHERE community_id=${community_id}
			`;
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
				SELECT space_id, name, url, view, updated, created, community_id
				FROM spaces WHERE community_id=${community_id} AND url=${url}
			`;
			console.log('[spaceRepo] space data', data);
			return {ok: true, value: data[0]};
		},
		create: async (
			name: string,
			view: ViewData,
			url: string,
			community_id: number,
		): Promise<Result<{value: Space}>> => {
			const data = await db.sql<Space[]>`
				INSERT INTO spaces (name, url, view, community_id) VALUES (
					${name},${url},${db.sql.json(view)},${community_id}
				) RETURNING *
			`;
			return {ok: true, value: data[0]};
		},
		createDefaultSpaces: async (
			community: Community,
		): Promise<Result<{value: Space[]}, ErrorResponse>> => {
			const spaces: Space[] = [];
			for (const params of toDefaultSpaces(community)) {
				// TODO parallelize this and remove the eslint override, but how to preserve order?
				// `db.repos.space.createMany`?
				// eslint-disable-next-line no-await-in-loop
				const result = await db.repos.space.create(
					params.name,
					params.view,
					params.url,
					params.community_id,
				);
				if (!result.ok) return {ok: false, message: 'failed to create default spaces'};
				spaces.push(result.value);
			}
			return {ok: true, value: spaces};
		},
		update: async (
			space_id: number,
			partial: Partial<Pick<Space, 'name' | 'url' | 'view'>>,
		): Promise<Result<{value: Space}, ErrorResponse>> => {
			console.log(`[db] updating data for space: ${space_id}`);
			// TODO hacky, fix when `postgres` v2 is out with dynamic queries
			const updated: Record<string, any> = {};
			for (const [key, value] of Object.entries(partial)) {
				updated[key] = value && typeof value === 'object' ? JSON.stringify(value) : value;
			}
			console.log(`updated`, updated);
			const result = await db.sql<Space[]>`
				UPDATE spaces
				SET updated=NOW(), ${db.sql(updated, ...Object.keys(updated))}
				WHERE space_id= ${space_id}
				RETURNING *
			`;
			if (!result.count) {
				return {ok: false, message: 'failed to update space'};
			}
			return {ok: true, value: result[0]};
		},
		deleteById: async (
			space_id: number,
		): Promise<Result<{value: any[]}, {type: 'deletion_error'} & ErrorResponse>> => {
			console.log('[spaceRepo] deleting space :', space_id);
			const data = await db.sql<any[]>`
				DELETE FROM spaces WHERE ${space_id}=space_id
			`;
			if (data.count !== 1) {
				return {
					ok: false,
					type: 'deletion_error',
					message: 'failed to delete space',
				};
			}
			return {ok: true, value: data};
		},
	} as const);
