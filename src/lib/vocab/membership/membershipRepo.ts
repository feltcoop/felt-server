import type {Result} from '@feltcoop/felt';

import type {Membership} from '$lib/vocab/membership/membership.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

export const membershipRepo = (db: Database) => ({
	create: async (
		persona_id: number,
		community_id: number,
	): Promise<Result<{value: Membership}, ErrorResponse>> => {
		// TODO use `unwrap` and propagate errors

		// Personal communities disallow memberships as a hard rule.
		// They're currently linked by name; this could be changed,
		// e.g. adding `persona.community_id` and `community.persona_id`
		const existingCommunityResult = await db.repos.community.findById(community_id);
		if (!existingCommunityResult.ok) return existingCommunityResult;
		const existingCommunity = existingCommunityResult.value;
		if (existingCommunity) {
			const personaResult = await db.repos.persona.findByName(existingCommunity.name);
			if (!personaResult.ok) return personaResult;
			const persona = personaResult.value;
			if (persona && persona.persona_id !== persona_id) {
				// TODO return a specific error type?
				return {ok: false, message: 'personal communities disallow memberships'};
			}
		}

		const data = await db.sql<Membership[]>`
			INSERT INTO memberships (persona_id, community_id) VALUES (
				${persona_id},${community_id}
			) RETURNING *
		`;
		console.log('[db] created membership', data);
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
});
