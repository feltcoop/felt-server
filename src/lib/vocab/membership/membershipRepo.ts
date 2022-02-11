import type {Result} from '@feltcoop/felt';

import type {Membership} from '$lib/vocab/membership/membership.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

export const membershipRepo = (db: Database) =>
	({
		create: async (
			persona_id: number,
			community_id: number,
		): Promise<Result<{value: Membership}, ErrorResponse>> => {
			const data = await db.sql<Membership[]>`
			INSERT INTO memberships (persona_id, community_id) VALUES (
				${persona_id},${community_id}
			) RETURNING *
		`;
			console.log('[db] created membership', data[0]);
			return {ok: true, value: data[0]};
		},
		findById: async (
			persona_id: number,
			community_id: number,
		): Promise<Result<{value: Membership}, {type: 'query_error'} & ErrorResponse>> => {
			const data = await db.sql<Membership[]>`
			SELECT persona_id, community_id, created, updated
			FROM memberships
			WHERE ${persona_id}=persona_id AND ${community_id}=community_id
		`;
			if (data.length) {
				return {ok: true, value: data[0]};
			}
			return {
				ok: false,
				type: 'query_error',
				message: 'no membership found',
			};
		},
		filterByAccount: async (
			account_id: number,
		): Promise<Result<{value: Membership[]}, ErrorResponse>> => {
			console.log(`[membershipRepo] preparing to query for memberships by account: ${account_id}`);
			const data = await db.sql<Membership[]>`
			SELECT m.persona_id, m.community_id, m.created, m.updated 
			FROM memberships m JOIN (
				SELECT DISTINCT m.community_id FROM personas p 
				JOIN memberships m 
				ON p.persona_id=m.persona_id AND p.account_id = ${account_id}
			) apc
			ON m.community_id=apc.community_id;
		`;
			return {ok: true, value: data};
		},
		filterByCommunityId: async (
			community_id: number,
		): Promise<Result<{value: Membership[]}, ErrorResponse>> => {
			console.log(
				`[membershipRepo] preparing to query for memberships by community: ${community_id}`,
			);
			const data = await db.sql<Membership[]>`
			SELECT m.persona_id, m.community_id, m.created, m.updated 
			FROM memberships m 
			WHERE m.community_id=${community_id};
		`;
			return {ok: true, value: data};
		},
		deleteById: async (
			persona_id: number,
			community_id: number,
		): Promise<Result<{value: any[]}, {type: 'deletion_error'} & ErrorResponse>> => {
			const data = await db.sql<any[]>`
			DELETE FROM memberships 
			WHERE ${persona_id}=persona_id AND ${community_id}=community_id
		`;

			if (data.count !== 1) {
				return {
					ok: false,
					type: 'deletion_error',
					message: 'failed to delete membership',
				};
			}

			return {ok: true, value: data};
		},
	} as const);
