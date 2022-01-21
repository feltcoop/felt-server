import type {Result} from '@feltcoop/felt';

import type {Persona} from '$lib/vocab/persona/persona.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';
import type {Community} from '$lib/vocab/community/community.js';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community';

export const personaRepo = (db: Database) => ({
	// TODO instead of these null values, probably want a type union strongly typed for each persona type
	create: async (
		type: Persona['type'],
		name: string,
		account_id: number | null,
		// TODO clean up when logic is moved to services:
		// `community_id` is `null` for `account` personas, gets set after creating personal community
		community_id: number | null,
	): Promise<Result<{value: {persona: Persona; community: Community}}, ErrorResponse>> => {
		// TODO maybe `insertCommunity` helper?
		const data = await db.sql<Persona[]>`
			INSERT INTO personas (type, name, account_id, community_id) VALUES (
				${type}, ${name}, ${account_id}, ${community_id}
			) RETURNING *
		`;
		const persona = data[0];
		console.log('[db] created persona', persona);
		if (type === 'account') {
			const createCommunityResult = await db.repos.community.create(
				'personal',
				name,
				toDefaultCommunitySettings(name),
				persona.persona_id,
			);
			if (!createCommunityResult.ok) {
				return {ok: false, message: 'failed to create initial persona community'};
			}
			// TODO this is a hack -- always adding/expecting `community_ids`
			// like in `filterByAccount` below is probably not the best idea because of overfetching
			const community = createCommunityResult.value;
			// TODO another hack
			await db.sql`
				UPDATE personas SET community_id = ${community.community_id}
					WHERE persona_id = ${persona.persona_id}
			`;
			persona.community_id = community.community_id;
			persona.community_ids = [community.community_id];
			// TODO this is also a yucky hack
			community.memberPersonas = [persona];
			return {ok: true, value: {persona, community}};
		} else {
			// TODO this is a hack that can be removed when this code is moved into the service layer
			return {ok: true, value: {persona, community: null as any}};
		}
	},
	filterByAccount: async (
		account_id: number,
	): Promise<Result<{value: Persona[]}, ErrorResponse>> => {
		console.log('[personaRepo] filtering by account', account_id);
		const data = await db.sql<Persona[]>`
			SELECT p.persona_id, p.type, p.name, p.account_id, p.community_id, p.created, p.updated,

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
	// TODO `findById` could be constructed by a generic function with id/columns params
	findById: async (
		persona_id: number,
	): Promise<Result<{value: Persona}, {type: 'no_persona_found'} & ErrorResponse>> => {
		console.log('[personaRepo] loading persona', persona_id);
		const data = await db.sql<Persona[]>`
			SELECT persona_id, type, name, account_id, community_id, created, updated FROM personas WHERE persona_id=${persona_id}
		`;
		if (data.length) {
			console.log('[personaRepo] persona found, returning', persona_id);
			return {ok: true, value: data[0]};
		}
		return {
			ok: false,
			type: 'no_persona_found',
			message: `No persona found with persona_id: ${persona_id}`,
		};
	},
	findByName: async (
		name: string,
	): Promise<Result<{value: Persona | undefined}, ErrorResponse>> => {
		console.log('[personaRepo] filtering by name', name);
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
			SELECT persona_id, name FROM personas WHERE type = 'account'
		`;
		return {ok: true, value: data};
	},
});
