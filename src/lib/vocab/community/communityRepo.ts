import type {Result} from '@feltcoop/felt';

import type {Community} from '$lib/vocab/community/community.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

export const communityRepo = (db: Database) => ({
	create: async (
		name: string,
		persona_id: number,
		settings: Community['settings'],
	): Promise<Result<{value: Community}>> => {
		const data = await db.sql<Community[]>`
			INSERT INTO communities (name, settings) VALUES (
				${name}, ${db.sql.json(settings)}
			) RETURNING *
		`;
		console.log('[db] created community', data, {persona_id});
		const community = data[0];
		const community_id = community.community_id;
		// TODO more robust error handling or condense into single query
		const membershipResult = await db.repos.membership.create(persona_id, community_id);
		if (!membershipResult.ok) return membershipResult;
		const spacesResult = await db.repos.space.createDefaultSpaces(community); // TODO should this work happen elsewhere?
		if (!spacesResult.ok) return spacesResult;
		community.spaces = spacesResult.value;
		return {ok: true, value: community};
	},
	findById: async (
		community_id: number,
	): Promise<Result<{value: Community}, {type: 'no_community_found'} & ErrorResponse>> => {
		console.log(`[db] preparing to query for community id: ${community_id}`);
		const data = await db.sql<Community[]>`
      SELECT community_id, name, settings, created, updated FROM communities where community_id = ${community_id}
    `;
		// console.log('[db.findById]', data);
		if (data.length) {
			return {ok: true, value: data[0]};
		}
		return {
			ok: false,
			type: 'no_community_found',
			reason: `No community found with id: ${community_id}`,
		};
	},
	filterByAccount: async (
		account_id: number,
	): Promise<Result<{value: Community[]}, ErrorResponse>> => {
		console.log(`[db] preparing to query for communities & spaces persona: ${account_id}`);
		const data = await db.sql<Community[]>`		
			SELECT c.community_id, c.name, c.settings, c.created, c.updated,
				(
					SELECT array_to_json(coalesce(array_agg(row_to_json(d)), '{}'))
					FROM (
						SELECT s.space_id, s.name, s.url, s.media_type, s.content, s.created, s.updated FROM spaces s WHERE s.community_id = c.community_id
					) d
				) as spaces,
				(
					SELECT array_to_json(coalesce(array_agg(row_to_json(d)), '{}'))
					FROM (
						SELECT p.persona_id, p.name FROM personas p JOIN memberships m ON p.persona_id=m.persona_id AND m.community_id=c.community_id
					) d
				) as "memberPersonas"
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
	): Promise<Result<{}, ErrorResponse>> => {
		const data = await db.sql<any[]>`
			UPDATE communities SET settings=${db.sql.json(settings)} WHERE community_id=${community_id} 
		`;
		if (!data.count) {
			return {ok: false, reason: 'no communities were modified'};
		}
		return {ok: true};
	},
});
