import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import type {AccountPersona, CommunityPersona, Persona} from '$lib/vocab/persona/persona';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

const log = new Logger(gray('[') + blue('personaRepo') + gray(']'));

export const personaRepo = (db: Database) =>
	({
		// TODO instead of these null values, probably want a type union strongly typed for each persona type
		createAccountPersona: async (
			name: string,
			account_id: number,
			community_id: number,
		): Promise<Result<{value: AccountPersona}, ErrorResponse>> => {
			const data = await db.sql<AccountPersona[]>`
				INSERT INTO personas (type, name, account_id, community_id) VALUES (
					'account', ${name}, ${account_id}, ${community_id}
				) RETURNING *
			`;
			const persona = data[0];
			log.trace('[db] created persona', persona);
			return {ok: true, value: persona};
		},
		createCommunityPersona: async (
			name: string,
			community_id: number,
		): Promise<Result<{value: CommunityPersona}, ErrorResponse>> => {
			const data = await db.sql<CommunityPersona[]>`
				INSERT INTO personas (type, name, community_id) VALUES (
					'community', ${name}, ${community_id}
				) RETURNING *
			`;
			const persona = data[0];
			log.trace('[db] created persona', persona);
			return {ok: true, value: persona};
		},
		filterByAccount: async (
			account_id: number,
		): Promise<Result<{value: Persona[]}, ErrorResponse>> => {
			log.trace('[filterByAccount]', account_id);
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
			log.trace('[findById]', persona_id);
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
			log.trace('[findByCommunityId]', community_id);
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
			log.trace('[findByName]', name);
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
