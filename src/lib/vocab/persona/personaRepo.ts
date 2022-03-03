import type {Result} from '@feltcoop/felt';

import type {Persona} from '$lib/vocab/persona/persona';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

export const personaRepo = (db: Database) =>
	({
		// TODO instead of these null values, probably want a type union strongly typed for each persona type
		create: async (
			type: Persona['type'],
			name: string,
			account_id: number | null,
			community_id: number,
		): Promise<Result<{value: Persona}, ErrorResponse>> => {
			const data = await db.sql<Persona[]>`
				INSERT INTO personas (type, name, account_id, community_id) VALUES (
					${type}, ${name}, ${account_id}, ${community_id}
				) RETURNING *
			`;
			const persona = data[0];
			console.log('[db] created persona', persona);
			return {ok: true, value: persona};
		},
		filterByAccount: async (
			account_id: number,
		): Promise<Result<{value: Persona[]}, ErrorResponse>> => {
			console.log('[personaRepo] filtering by account', account_id);
			const data = await db.sql<Persona[]>`
				SELECT p.persona_id, p.type, p.name, p.account_id, p.community_id, p.created, p.updated
				FROM personas p WHERE p.account_id = ${account_id}
			`;
			return {ok: true, value: data};
		},
		// TODO `findById` could be constructed by a generic function with id/columns params
		findById: async (
			persona_id: number,
		): Promise<Result<{value: Persona}, {type: 'no_persona_found'} & ErrorResponse>> => {
			console.log('[personaRepo] loading persona', persona_id);
			const data = await db.sql<Persona[]>`
				SELECT persona_id, type, name, account_id, community_id, created, updated 
				FROM personas WHERE persona_id=${persona_id}
			`;
			if (data.length) {
				return {ok: true, value: data[0]};
			}
			return {
				ok: false,
				type: 'no_persona_found',
				message: 'no persona found',
			};
		},
		findByCommunityId: async (
			community_id: number,
		): Promise<Result<{value: Persona}, {type: 'no_persona_found'} & ErrorResponse>> => {
			console.log('[PersonaRepo] finding persona for community', community_id);
			const data = await db.sql<Persona[]>`
				SELECT persona_id, type, name, account_id, community_id, created, updated 
				FROM personas WHERE community_id=${community_id}
			`;
			if (data.length) {
				return {ok: true, value: data[0]};
			}
			return {
				ok: false,
				type: 'no_persona_found',
				message: 'no persona found',
			};
		},
		findByName: async (
			name: string,
		): Promise<Result<{value: Persona | undefined}, ErrorResponse>> => {
			console.log('[PersonaRepo] filtering by name', name);
			const data = await db.sql<Persona[]>`
				SELECT persona_id, type, name, account_id, community_id, created, updated
				FROM personas WHERE LOWER(name) = LOWER(${name})
			`;
			return {ok: true, value: data[0]};
		},
		// TODO needs to be a subset just for the session, maybe either `community_ids` or `account_id` as a param
		// TODO this type isn't `Persona`, it's a public subset of fields
		getAll: async (): Promise<Result<{value: Persona[]}, ErrorResponse>> => {
			const data = await db.sql<Persona[]>`
				SELECT persona_id, name, type FROM personas
			`;
			return {ok: true, value: data};
		},
	} as const);
