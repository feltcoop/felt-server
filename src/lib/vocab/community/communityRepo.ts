import type {Result} from '@feltcoop/felt';

import type {Community} from '$lib/vocab/community/community.js';
import type {Database} from '$lib/db/Database';

export const communityRepo = (db: Database) => ({
	find_by_id: async (
		community_id: string,
	): Promise<Result<{value: Community}, {type: 'no_community_found'; reason: string}>> => {
		console.log(`[db] preparing to query for community id: ${community_id}`);
		const data = await db.sql<Community[]>`
      select community_id, name from communities where community_id = ${community_id}
    `;
		console.log('[db] community data', data);
		if (data.length) {
			return {ok: true, value: data[0]};
		}
		return {
			ok: false,
			type: 'no_community_found',
			reason: `No community found with id: ${community_id}`,
		};
	},
	filter_by_account: async (account_id: number): Promise<Result<{value: Community[]}>> => {
		console.log(`[db] preparing to query for communities & spaces persona: ${account_id}`);
		const data = await db.sql<Community[]>`		
    select c.community_id, c.name,
    (
      select array_to_json(coalesce(array_agg(row_to_json(d)), '{}'))
      from (
        SELECT s.space_id, s.name, s.url, s.media_type, s.content FROM spaces s JOIN community_spaces cs ON s.space_id=cs.space_id AND cs.community_id=c.community_id
      ) d
    ) as spaces,
    (
      select array_to_json(coalesce(array_agg(row_to_json(d)), '{}'))
      from (
        SELECT p.persona_id, p.name FROM personas p JOIN persona_communities pc ON p.persona_id=pc.persona_id AND pc.community_id=c.community_id
      ) d
    ) as members 
  from communities c JOIN (
    SELECT DISTINCT pc.community_id FROM personas p JOIN persona_communities pc ON p.persona_id=pc.persona_id AND p.account_id = ${account_id}
  ) apc
  ON c.community_id=apc.community_id;			
    `;
		console.log('[db] community data', data);
		return {ok: true, value: data};
	},
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
		const member_result = await db.repos.member.create(persona_id, community_id);
		if (!member_result.ok) return member_result;
		const spaces_result = await db.repos.space.create_default_spaces(community_id);
		if (!spaces_result.ok) return spaces_result;
		community.spaces = spaces_result.value;
		return {ok: true, value: community};
	},
});
