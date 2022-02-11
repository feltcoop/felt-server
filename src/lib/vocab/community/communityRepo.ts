import type {Result} from '@feltcoop/felt';

import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

export const communityRepo = (db: Database) =>
	({
		create: async (
			type: Community['type'],
			name: string,
			settings: Community['settings'],
			persona_id: number,
		): Promise<Result<{value: {community: Community; spaces: Space[]}}, ErrorResponse>> => {
			const data = await db.sql<Community[]>`
				INSERT INTO communities (type, name, settings) VALUES (
					${type}, ${name}, ${db.sql.json(settings)}
				) RETURNING *
			`;
			console.log('[db] created community', data[0], {persona_id});
			const community = data[0];
			const {community_id} = community;
			// TODO move this code into the service layer
			if (type === 'standard') {
				const personaResult = await db.repos.persona.create(
					'community',
					community.name,
					null,
					community_id,
				);
				if (!personaResult.ok) return personaResult;
				const membershipResult = await db.repos.membership.create(
					personaResult.value.persona.persona_id,
					community_id,
				);
				if (!membershipResult.ok) return membershipResult;
			}
			// TODO more robust error handling or condense into single query
			const membershipResult = await db.repos.membership.create(persona_id, community_id);
			if (!membershipResult.ok) return membershipResult;
			const spacesResult = await db.repos.space.createDefaultSpaces(community); // TODO should this work happen elsewhere?
			if (!spacesResult.ok) return spacesResult;
			const spaces = spacesResult.value;
			return {ok: true, value: {community, spaces}};
		},
		findById: async (
			community_id: number,
		): Promise<Result<{value: Community}, {type: 'no_community_found'} & ErrorResponse>> => {
			console.log(`[db] preparing to query for community id: ${community_id}`);
			const data = await db.sql<Community[]>`
				SELECT community_id, type, name, settings, created, updated
				FROM communities WHERE community_id=${community_id}
			`;
			// console.log('[db.findById]', data);
			if (data.length) {
				return {ok: true, value: data[0]};
			}
			return {
				ok: false,
				type: 'no_community_found',
				message: 'no community found',
			};
		},
		findByName: async (
			name: string,
		): Promise<Result<{value: Community | undefined}, ErrorResponse>> => {
			console.log('[communityRepo] finding by name', name);
			const data = await db.sql<Community[]>`
				SELECT community_id, type, name, settings, created, updated
				FROM communities WHERE LOWER(name) = LOWER(${name})
			`;
			return {ok: true, value: data[0]};
		},
		filterByAccount: async (
			account_id: number,
		): Promise<Result<{value: Community[]}, ErrorResponse>> => {
			console.log(`[db] preparing to query for communities & spaces persona: ${account_id}`);
			const data = await db.sql<Community[]>`
				SELECT c.community_id, c.type, c.name, c.settings, c.created, c.updated							
				FROM communities c JOIN (
					SELECT DISTINCT m.community_id FROM personas p JOIN memberships m ON p.persona_id=m.persona_id AND p.account_id = ${account_id}
				) apc
				ON c.community_id=apc.community_id;
			`;
			console.log('[db.filterByAccount]', data.length);
			return {ok: true, value: data};
		},
		updateSettings: async (
			community_id: number,
			settings: Community['settings'],
		): Promise<Result<object, ErrorResponse>> => {
			const data = await db.sql<any[]>`
				UPDATE communities SET settings=${db.sql.json(settings)} WHERE community_id=${community_id}
			`;
			if (!data.count) {
				return {ok: false, message: 'failed to update settings'};
			}
			return {ok: true};
		},
	} as const);
