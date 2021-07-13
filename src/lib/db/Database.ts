import type {Result} from '@feltcoop/felt';
import {unwrap} from '@feltcoop/felt';

import type {Account_Session} from '$lib/session/client_session.js';
import type {Community} from '$lib/communities/community.js';
import type {Space} from '$lib/spaces/space.js';
import type {Post} from '$lib/posts/post.js';
import type {Member} from '$lib/members/member.js';
import type {Account} from '$lib/vocab/account/account.js';
import type {Entity} from '$lib/vocab/entity/entity.js';
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
			load_client_session: async (name: string): Promise<Result<{value: Account_Session}>> => {
				console.log('[db] load_client_session', name);
				let account: Account = unwrap(await this.repos.accounts.find_by_name(name));
				let communities: Community[] = unwrap(
					await this.repos.communities.filter_by_account(account.account_id!),
				);
				let friends: Member[] = unwrap(await this.repos.members.get_all());
				let entities: Entity[] = unwrap(await this.repos.entities.find_by_account(name));
				return {
					ok: true,
					value: {account, communities, friends, entities},
				};
			},
		},
		accounts: {
			create: async (
				name: string,
				password: string,
			): Promise<Result<{value: Account}, {reason: string}>> => {
				const account = {name, password};
				const data = await this.sql`
					insert into accounts (name, password) values (
						${name}, ${password}
					)`;
				console.log(data);
				return {ok: true, value: account};
			},
			find_by_name: async (
				name: string,
			): Promise<
				Result<
					{value: Account},
					{type: 'invalid_name'; reason: string} | {type: 'no_account_found'; reason: string}
				>
			> => {
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
			// TODO: this is a hack to stub out "friends" for inviting to a Community.
			//This should use a community_id to filter or something
			get_all: async (): Promise<Result<{value: Member[]}, {reason: string}>> => {
				const data = await this.sql<Member[]>`
					select account_id, name from accounts
				`;
				return {ok: true, value: data};
			},
			// TODO: refactor this code to return 'Member'
			create: async (account_id: number, community_id: string): Promise<Result<{value: any}>> => {
				const data = await this.sql`
					INSERT INTO account_communities (account_id, community_id) VALUES (
						${account_id},${community_id}
					) RETURNING *			
				`;
				console.log('[db] created account_communities', data);
				return {ok: true, value: data};
			},
		},
		entities: {
			find_by_account: async (
				name: string,
			): Promise<
				Result<
					{value: Entity[]},
					{type: 'invalid_name'; reason: string} | {type: 'no_account_found'; reason: string}
				>
			> => {
				return {
					ok: true,
					value: [
						{type: 'Entity', id: '1', data: {author: name, text: 'hello'}},
						{type: 'Entity', id: '2', data: {author: name, text: 'world'}},
					],
				};
			},
		},
		communities: {
			find_by_id: async (
				community_id: string,
			): Promise<Result<{value: Community[]}, {type: 'no_community_found'; reason: string}>> => {
				console.log(`[db] preparing to query for community id: ${community_id}`);
				const data = await this.sql<Community[]>`
					select community_id, name from communities where community_id = ${community_id}
				`;
				console.log('[db] community data', data);
				if (data.length) {
					return {ok: true, value: data};
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
				// TODO is there a way to do this via sql? Or do we just add a default `/general` space to all new communities?
				data[0].spaces = [];
				const community_id: number = data[0].community_id!;
				console.log(community_id);
				// TODO more robust error handling or condense into single query
				const association = await this.sql<any>`
					INSERT INTO account_communities (account_id, community_id) VALUES (
					${account_id},${community_id}
					)
				`;
				console.log('[db] created account_communities', association);
				return {ok: true, value: data[0]};
			},
		},
		spaces: {
			find_by_id: async (
				space_id: string,
			): Promise<Result<{value: Space[]}, {type: 'no_space_found'; reason: string}>> => {
				console.log(`[db] preparing to query for space id: ${space_id}`);
				const data = await this.sql<Space[]>`
					select space_id, url, media_type, content from spaces where space_id = ${space_id}
				`;
				console.log('[db] space data', data);
				if (data.length) {
					return {ok: true, value: data};
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
				community_id: string,
				url: string,
				media_type: string,
				content: string,
			): Promise<Result<{value: Space}>> => {
				const data = await this.sql<Space[]>`
					INSERT INTO spaces (url, media_type, content) VALUES (
						${url},${media_type},${content}
					) RETURNING *
				`;
				console.log('[db] created space', data);
				const space_id: number = data[0].space_id!;
				console.log(community_id);
				// TODO more robust error handling or condense into single query
				const association = await this.sql<any>`
					INSERT INTO community_spaces (space_id, community_id) VALUES (
						${space_id},${community_id}
					)
				`;
				console.log('[db] created community_space', association);
				return {ok: true, value: data[0]};
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
