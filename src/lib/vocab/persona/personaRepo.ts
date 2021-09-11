import type {Result} from '@feltcoop/felt';

import type {Persona} from '$lib/vocab/persona/persona.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';
import type {Community} from '$lib/vocab/community/community.js';

export const personaRepo = (db: Database) => ({
	create: async (
		name: string,
		account_id: number,
	): Promise<Result<{value: {persona: Persona; community: Community}}, ErrorResponse>> => {
		const data = await db.sql<Persona[]>`
      insert into personas (name, account_id) values (
        ${name}, ${account_id}
      ) RETURNING *`;
		const persona = data[0];
		console.log('[db] created persona', persona);
		const createCommunityResult = await db.repos.community.create(name, persona.persona_id);
		if (!createCommunityResult.ok) {
			return {ok: false, reason: 'Failed to create initial persona community'};
		}
		return {ok: true, value: {persona, community: createCommunityResult.value}};
	},
	filterByAccount: async (
		account_id: number,
	): Promise<Result<{value: Persona[]}, ErrorResponse>> => {
		const data = await db.sql<Persona[]>`
      SELECT p.persona_id, p.account_id, p.name,

      (
        SELECT array_to_json(coalesce(array_agg(d.community_id)))
        FROM (
          SELECT pc.community_id FROM persona_communities pc WHERE pc.persona_id = p.persona_id
        ) d
      ) AS community_ids
      
      FROM personas p WHERE p.account_id = ${account_id}
      `;
		return {ok: true, value: data};
	},
});
