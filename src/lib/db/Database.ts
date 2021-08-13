import type {Result} from '@feltcoop/felt';
import {unwrap} from '@feltcoop/felt';

import type {Account_Session} from '$lib/session/client_session.js';
import type {Community} from '$lib/communities/community.js';
import type {Space, Space_Params} from '$lib/spaces/space.js';
import type {Post} from '$lib/posts/post.js';
import type {Member} from '$lib/members/member.js';
import type {Account, Account_Model, Account_Params} from '$lib/vocab/account/account.js';
import {account_properties, account_model_properties} from '$lib/vocab/account/account';
import type {Postgres_Sql} from '$lib/db/postgres.js';

export interface Options {
	sql: Postgres_Sql;
}

// TODO create seperate models used by the front end (w/ camelCase attributes) from the repo models
// and snake_case for the DB stuff
export class Database {
	sql: Postgres_Sql;

	constructor({sql}: Options) {
		console.log('[db] create');
		this.sql = sql;
	}

	async close(): Promise<void> {
		console.log('[db] close');
		await this.sql.end();
	}

	// TODO declaring like this is weird, should be static, but not sure what interface is best
	repos = {
		session: {
			load_client_session: async (
				account_id: number,
			): Promise<Result<{value: Account_Session}>> => {
				console.log('[db] load_client_session', account_id);
				const account: Account_Model = unwrap(
					await this.repos.accounts.find_by_id(account_id, account_model_properties),
				);
				const communities: Community[] = unwrap(
					await this.repos.communities.filter_by_account(account.account_id),
				);
				const members: Member[] = unwrap(await this.repos.members.get_all());
				return {
					ok: true,
					value: {account, communities, members},
				};
			},
		},
		accounts: {
			create: async ({
				name,
				password,
			}: Account_Params): Promise<Result<{value: Account}, {reason: string}>> => {
				const data = await this.sql<Account[]>`
					insert into accounts (name, password) values (
						${name}, ${password}
					) RETURNING *`;
				console.log(data);
				const account = data[0];
				const result = await this.repos.communities.insert(name, account.account_id!);
				if (!result.ok) {
					return {ok: false, reason: 'Failed to create initial user community'};
				}
				return {ok: true, value: account};
			},
			find_by_id: async (
				account_id: number,
				columns: string[] = account_properties,
			): Promise<Result<{value: Account}, {type: 'no_account_found'; reason: string}>> => {
				const data = await this.sql<Account[]>`
					select ${this.sql(columns)} from accounts where account_id = ${account_id}
				`;
				if (data.length) {
					return {ok: true, value: data[0]};
				}
				return {
					ok: false,
					type: 'no_account_found',
					reason: `No account found with account_id: ${account_id}`,
				};
			},
			find_by_name: async (
				name: string,
			): Promise<Result<{value: Account}, {type: 'no_account_found'; reason: string}>> => {
				const data = await this.sql<Account[]>`
					select account_id, name, password from accounts where name = ${name}
				`;
				if (data.length) {
					return {ok: true, value: data[0]};
				}
				return {ok: false, type: 'no_account_found', reason: `No account found with name: ${name}`};
			},
		},
		members: {
			// TODO: this is a hack to stub out "members" for inviting to a Community.
			//This should use a community_id to filter or something
			get_all: async (): Promise<Result<{value: Member[]}, {reason: string}>> => {
				const data = await this.sql<Member[]>`
					select account_id, name from accounts
				`;
				return {ok: true, value: data};
			},
			create: async (
				account_id: number,
				community_id: number,
			): Promise<Result<{value: Member}>> => {
				const data = await this.sql<Member[]>`
					INSERT INTO account_communities (account_id, community_id) VALUES (
						${account_id},${community_id}
					) RETURNING *			
				`;
				console.log('[db] created account_communities', data);
				return {ok: true, value: data[0]};
			},
		},
		communities: {
			find_by_id: async (
				community_id: string,
			): Promise<Result<{value: Community}, {type: 'no_community_found'; reason: string}>> => {
				console.log(`[db] preparing to query for community id: ${community_id}`);
				const data = await this.sql<Community[]>`
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
				console.log(`[db] preparing to query for communities & spaces account: ${account_id}`);
				const data = await this.sql<Community[]>`		
					select c.community_id, c.name,
    				(
      				select array_to_json(coalesce(array_agg(row_to_json(d)), '{}'))
      				from (
        				SELECT s.space_id, s.url, s.media_type, s.content FROM spaces s JOIN community_spaces cs ON s.space_id=cs.space_id AND cs.community_id=c.community_id      				
      				) d
    				) as spaces,
						(
							select array_to_json(coalesce(array_agg(row_to_json(d)), '{}'))
							from (
								SELECT a.account_id, a.name FROM accounts a JOIN account_communities ac ON a.account_id=ac.account_id AND ac.community_id=c.community_id
							) d
						) as members 
  				from communities c JOIN account_communities ac
  				ON c.community_id=ac.community_id AND ac.account_id=${account_id}				
				`;
				console.log('[db] community data', data);
				return {ok: true, value: data};
			},
			insert: async (name: string, account_id: number): Promise<Result<{value: Community}>> => {
				const data = await this.sql<Community[]>`
					INSERT INTO communities (name) VALUES (
						${name}
					) RETURNING *
				`;
				console.log('[db] created community', data);
				const community = data[0];
				const community_id = community.community_id;
				console.log(community_id);
				// TODO more robust error handling or condense into single query
				const association = await this.sql<any>`
					INSERT INTO account_communities (account_id, community_id) VALUES (
					${account_id},${community_id}
					)
				`;
				console.log('[db] created account_communities', association);
				const spaces_result = await this.repos.spaces.insert_default_spaces(community_id);
				if (!spaces_result.ok) return spaces_result;
				community.spaces = spaces_result.value;
				return {ok: true, value: community};
			},
		},
		spaces: {
			find_by_id: async (
				space_id: string,
			): Promise<Result<{value: Space}, {type: 'no_space_found'; reason: string}>> => {
				console.log(`[db] preparing to query for space id: ${space_id}`);
				const data = await this.sql<Space[]>`
					select space_id, url, media_type, content from spaces where space_id = ${space_id}
				`;
				console.log('[db] space data', data);
				if (data.length) {
					return {ok: true, value: data[0]};
				}
				return {
					ok: false,
					type: 'no_space_found',
					reason: `No space found with id: ${space_id}`,
				};
			},
			filter_by_community: async (community_id: string): Promise<Result<{value: Space[]}>> => {
				console.log(`[db] preparing to query for community spaces: ${community_id}`);
				const data = await this.sql<Space[]>`
					SELECT s.space_id, s.url, s.media_type, s.content FROM spaces s JOIN community_spaces cs ON s.space_id=cs.space_id AND cs.community_id= ${community_id}
				`;
				console.log('[db] community data', data);
				return {ok: true, value: data};
			},
			insert: async (
				community_id: number,
				params: Space_Params,
			): Promise<Result<{value: Space}>> => {
				const {name, content, media_type, url} = params;
				const data = await this.sql<Space[]>`
					INSERT INTO spaces (name, url, media_type, content) VALUES (
						${name},${url},${media_type},${content}
					) RETURNING *
				`;
				console.log('[db] created space', data);
				const space_id: number = data[0].space_id!;
				console.log('[db] creating community space', community_id, space_id);
				// TODO more robust error handling or condense into single query
				const association = await this.sql<any>`
					INSERT INTO community_spaces (space_id, community_id) VALUES (
						${space_id},${community_id}
					)
				`;
				console.log('[db] created community_space', association);
				return {ok: true, value: data[0]};
			},
			insert_default_spaces: async (
				community_id: number,
			): Promise<Result<{value: Space[]}, {reason: string}>> => {
				const result = await Promise.all([
					this.repos.spaces.insert(community_id, {
						name: 'chat',
						url: '/chat',
						media_type: 'application/fuz+json',
						content: '{"type": "Chat", "props": {"data": "/chat/posts"}}',
					}),
					this.repos.spaces.insert(community_id, {
						name: 'board',
						url: '/board',
						media_type: 'application/fuz+json',
						content: '{"type": "Board", "props": {"data": "/board/posts"}}',
					}),
					this.repos.spaces.insert(community_id, {
						name: 'voice',
						url: '/voice',
						media_type: 'application/fuz+json',
						content: '{"type": "Voice", "props": {"data": "/voice/stream"}}',
					}),
				]);
				console.log('[db] created default spaces', community_id, result);
				const spaces: Space[] = [];
				for (const r of result) {
					if (!r.ok) return {ok: false, reason: 'Failed to create default spaces for community.'};
					spaces.push(r.value);
				}
				return {ok: true, value: spaces};
			},
		},
		posts: {
			insert: async (
				actor_id: number,
				space_id: string,
				content: string,
			): Promise<Result<{value: Post}>> => {
				const data = await this.sql<Post[]>`
					INSERT INTO posts (actor_id, space_id, content) VALUES (
						${actor_id},${space_id},${content}
					) RETURNING *
				`;
				console.log('[db] create post', data);
				return {ok: true, value: data[0]};
			},
			filter_by_space: async (space_id: string): Promise<Result<{value: Post[]}>> => {
				console.log(`[db] preparing to query for space posts: ${space_id}`);
				const data = await this.sql<Post[]>`
					SELECT p.post_id, p.content, p.actor_id, p.space_id FROM posts p WHERE p.space_id= ${space_id}
				`;
				console.log('[db] space posts', data);
				return {ok: true, value: data};
			},
		},
	};
}
