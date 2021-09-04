import type {Result} from '@feltcoop/felt';

import type {Persona} from '$lib/vocab/persona/persona.js';
import type {Database} from '$lib/db/Database';
import type {Community} from '$lib/vocab/community/community.js';

export const personaRepo = (db: Database) => ({
	create: async (
		name: string,
		account_id: number,
	): Promise<Result<{value: {persona: Persona; community: Community}}, {reason: string}>> => {
		const data = await db.sql<Persona[]>`
      insert into personas (name, account_id) values (
        ${name}, ${account_id}
      ) RETURNING *`;
		const persona = data[0];
		console.log('[db] created persona', persona);
		const create_community_result = await db.repos.community.create(name, persona.persona_id);
		if (!create_community_result.ok) {
			return {ok: false, reason: 'Failed to create initial persona community'};
		}
		return {ok: true, value: {persona, community: create_community_result.value}};
	},
	filter_by_account: async (
		account_id: number,
	): Promise<Result<{value: Persona[]}, {reason: string}>> => {
		const data = await db.sql<Persona[]>`
      select p.persona_id, p.account_id, p.name,

      (
        select array_to_json(coalesce(array_agg(d.community_id)))
        from (
          SELECT pc.community_id FROM persona_communities pc WHERE pc.persona_id = p.persona_id
        ) d
      ) as community_ids
      
      from personas p where p.account_id = ${account_id}
      `;
		if (data.length) {
			return {ok: true, value: data};
		}
		return {
			ok: false,
			reason: `No Personas found for account: ${account_id}`,
		};
	},
});
