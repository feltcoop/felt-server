import type {Result} from '@feltcoop/felt';

import type {Persona, PersonaParams} from '$lib/vocab/persona/persona.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';
import type {Community} from '$lib/vocab/community/community.js';

export const personaRepo = (db: Database) => ({
	create: async ({
		name,
		account_id,
	}: PersonaParams): Promise<
		Result<{value: {persona: Persona; community: Community}}, ErrorResponse>
	> => {
		const data = await db.sql<Persona[]>`
      insert into personas (name, account_id) values (
        ${name}, ${account_id}
      ) RETURNING *
		`;
		const persona = data[0];
		console.log('[db] created persona', persona);
		const createCommunityResult = await db.repos.community.create({
			name,
			persona_id: persona.persona_id,
		});
		if (!createCommunityResult.ok) {
			return {ok: false, reason: 'Failed to create initial persona community'};
		}
		return {ok: true, value: {persona, community: createCommunityResult.value}};
	},
	filterByAccount: async (
		account_id: number,
	): Promise<Result<{value: Persona[]}, ErrorResponse>> => {
		console.log('[personaRepo] filtering by account', account_id);
		const data = await db.sql<Persona[]>`
      select p.persona_id, p.account_id, p.name,

      (
        select array_to_json(coalesce(array_agg(d.community_id)))
        from (
          SELECT m.community_id FROM memberships m WHERE m.persona_id = p.persona_id
        ) d
      ) as community_ids
      
      from personas p where p.account_id = ${account_id}
		`;
		if (data.length) {
			console.log('[personaRepo] returning personas for account', account_id);
			return {ok: true, value: data};
		}
		return {
			ok: false,
			reason: `No Personas found for account: ${account_id}`,
		};
	},
	getAll: async (): Promise<Result<{value: Persona[]}, ErrorResponse>> => {
		const data = await db.sql<Persona[]>`
      select persona_id, name from personas
    `;
		return {ok: true, value: data};
	},
});
