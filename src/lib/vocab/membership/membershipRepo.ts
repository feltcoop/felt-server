import type {Result} from '@feltcoop/felt';

import type {Membership} from '$lib/vocab/membership/membership.js';
import type {Database} from '$lib/db/Database';
import type {CreateMembershipParams} from '$lib/app/eventTypes';
import type {ErrorResponse} from '$lib/util/error';

export const membershipRepo = (db: Database) => ({
	create: async ({
		persona_id,
		community_id,
	}: CreateMembershipParams): Promise<Result<{value: Membership}, ErrorResponse>> => {
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
				return {ok: false, reason: 'home communities disallow memberships'};
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
});
