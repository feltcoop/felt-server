import type {Result} from '@feltcoop/felt';

import type {Persona} from '$lib/vocab/persona/persona.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';
import type {Community} from '$lib/vocab/community/community.js';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community';

export const personaRepo = (db: Database) => ({
	create: async (
		name: string,
		account_id: number,
	): Promise<Result<{value: {persona: Persona; community: Community}}, ErrorResponse>> => {
		const data = await db.sql<Persona[]>`
			INSERT INTO personas (name, account_id) VALUES (
				${name}, ${account_id}
			) RETURNING *
		`;
		const persona = data[0];
		console.log('[db] created persona', persona);
		const createCommunityResult = await db.repos.community.create(
			name,
			persona.persona_id,
			toDefaultCommunitySettings(name),
		);
		if (!createCommunityResult.ok) {
			return {ok: false, message: 'failed to create initial persona community'};
		}
		// TODO this is a hack -- always adding/expecting `community_ids`
		// like in `filterByAccount` below is probably not the best idea because of overfetching
		const community = createCommunityResult.value;
		persona.community_ids = [community.community_id];
		// TODO this is also a yucky hack
		community.memberPersonas = [persona];
		return {ok: true, value: {persona, community}};
	},
	filterByAccount: async (
		account_id: number,
	): Promise<Result<{value: Persona[]}, ErrorResponse>> => {
		console.log('[personaRepo] filtering by account', account_id);
		const data = await db.sql<Persona[]>`
			SELECT p.persona_id, p.account_id, p.name, p.created, p.updated,

			(
				SELECT array_to_json(coalesce(array_agg(d.community_id)))
				FROM (
					SELECT m.community_id FROM memberships m WHERE m.persona_id = p.persona_id
				) d
			) AS community_ids

			FROM personas p WHERE p.account_id = ${account_id}
		`;
		return {ok: true, value: data};
	},
	findByName: async (
		name: string,
	): Promise<Result<{value: Persona | undefined}, ErrorResponse>> => {
		console.log('[personaRepo] filtering by name', name);
		const data = await db.sql<Persona[]>`
			SELECT persona_id, account_id, name, created, updated
			FROM personas WHERE LOWER(name) = LOWER(${name})
		`;
		return {ok: true, value: data[0]};
	},
	getAll: async (): Promise<Result<{value: Persona[]}, ErrorResponse>> => {
		const data = await db.sql<Persona[]>`
			SELECT persona_id, name FROM personas
		`;
		return {ok: true, value: data};
	},
});
