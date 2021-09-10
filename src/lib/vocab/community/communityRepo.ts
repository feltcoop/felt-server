import type {Result} from '@feltcoop/felt';

import type {Community} from '$lib/vocab/community/community.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

export const communityRepo = (db: Database) => ({
	findById: async (
		community_id: string,
	): Promise<Result<{value: Community}, {type: 'no_community_found'} & ErrorResponse>> => {
		console.log(`[db] preparing to query for community id: ${community_id}`);
		const data = await db.sql<Community[]>`
      SELECT community_id, name FROM communities where community_id = ${community_id}
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
	filterByAccount: async (account_id: number): Promise<Result<{value: Community[]}>> => {
		console.log(`[db] preparing to query for communities & spaces persona: ${account_id}`);
		const data = await db.sql<Community[]>`		
			SELECT c.community_id, c.name,
				(
					SELECT array_to_json(coalesce(array_agg(row_to_json(d)), '{}'))
					FROM (
						SELECT s.space_id, s.name, s.url, s.media_type, s.content FROM spaces s JOIN community_spaces cs ON s.space_id=cs.space_id AND cs.community_id=c.community_id
					) d
				) as spaces,
				(
					SELECT array_to_json(coalesce(array_agg(row_to_json(d)), '{}'))
					FROM (
						SELECT p.persona_id, p.name FROM personas p JOIN persona_communities pc ON p.persona_id=pc.persona_id AND pc.community_id=c.community_id
					) d
				) as members
			FROM communities c JOIN (
				SELECT DISTINCT pc.community_id FROM personas p JOIN persona_communities pc ON p.persona_id=pc.persona_id AND p.account_id = ${account_id}
			) apc
			ON c.community_id=apc.community_id;
    `;
		console.log('[db.filterByAccount]', data.length);
		return {ok: true, value: data};
	},
	// TODO community params
	create: async (name: string, persona_id: number): Promise<Result<{value: Community}>> => {
		const data = await db.sql<Community[]>`
      INSERT INTO communities (name) VALUES (
        ${name}
      ) RETURNING *
    `;
		console.log('[db] created community', data, {persona_id});
		const community = data[0];
		const community_id = community.community_id;
		// TODO more robust error handling or condense into single query
		const memberResult = await db.repos.member.create(persona_id, community_id);
		if (!memberResult.ok) return memberResult;
		const spacesResult = await db.repos.space.createDefaultSpaces(community_id);
		if (!spacesResult.ok) return spacesResult;
		community.spaces = spacesResult.value;
		return {ok: true, value: community};
	},
});
