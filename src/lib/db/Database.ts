import type {Result} from '@feltcoop/felt';
import {unwrap} from '@feltcoop/felt';

import type {AccountSession} from '$lib/session/client_session.js';
import type {Persona} from '$lib/personas/persona.js';
import type {Community} from '$lib/communities/community.js';
import type {Space, SpaceParams} from '$lib/spaces/space.js';
import type {Post} from '$lib/posts/post.js';
import type {Member} from '$lib/members/member.js';
import type {Account, AccountModel, AccountParams} from '$lib/vocab/account/account.js';
import {account_properties, account_model_properties} from '$lib/vocab/account/account';
import type {PostgresSql} from '$lib/db/postgres.js';
import {default_spaces} from '$lib/spaces/default_spaces';

export interface Options {
	sql: PostgresSql;
}

// TODO create seperate models used by the front end (w/ camelCase attributes) from the repo models
// and snake_case for the DB stuff
export class Database {
	sql: PostgresSql;

	constructor({sql}: Options) {
		console.log('[db] create');
		this.sql = sql;
	}

	async close(): Promise<void> {
		console.log('[db] close');
		await this.sql.end();
	}

	// TODO refactor
	repos = {
		session: {
			load_client_session: async (account_id: number): Promise<Result<{value: AccountSession}>> => {
				console.log('[db] load_client_session', account_id);
				const account: AccountModel = unwrap(
					await this.repos.accounts.find_by_id(account_id, account_model_properties),
				);
				let personas: Persona[] = unwrap(
					await this.repos.personas.filter_by_account(account.account_id),
				);
				const communities: Community[] = unwrap(
					await this.repos.communities.filter_by_account(account.account_id),
				);
				const members: Member[] = unwrap(await this.repos.members.get_all());
				return {
					ok: true,
					value: {account, personas, communities, members},
				};
			},
		},
		accounts: {
			create: async ({
				name,
				password,
			}: AccountParams): Promise<Result<{value: Account}, {reason: string}>> => {
				const data = await this.sql<Account[]>`
					insert into accounts (name, password) values (
						${name}, ${password}
					) RETURNING *`;
				console.log(data);
				const account = data[0];
				const persona_response = await this.repos.personas.create(name, account.account_id);
				if (!persona_response.ok) {
					return {ok: false, reason: 'Failed to create initial user persona'};
				}
				const result = await this.repos.communities.insert(name, persona_response.value.persona_id);
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
		personas: {
			create: async (
				name: string,
				account_id: number,
			): Promise<Result<{value: Persona}, {reason: string}>> => {
				const data = await this.sql<Persona[]>`
					insert into personas (name, account_id) values (
						${name}, ${account_id}
					) RETURNING *`;
				console.log(data);
				const persona = data[0];
				return {ok: true, value: persona};
			},
			filter_by_account: async (
				account_id: number,
			): Promise<Result<{value: Persona[]}, {reason: string}>> => {
				const data = await this.sql<Persona[]>`
				  select p.persona_id, p.account_id, p.name,

					(
						select array_to_json(coalesce(array_agg(d.community_id)))
						from (
							SELECT pc.community_id FROM persona_communities pc WHERE pc.persona_id = p.persona_id
						) d
					) as community_ids
					
					from personas p where p.account_id = ${account_id}
					`;
				if (data.length) {
					return {ok: true, value: data};
				}
				return {
					ok: false,
					reason: `No Personas found for account: ${account_id}`,
				};
			},
		},
		members: {
			// TODO: this is a hack to stub out "members" for inviting to a Community.
			//This should use a community_id to filter or something
			get_all: async (): Promise<Result<{value: Member[]}, {reason: string}>> => {
				const data = await this.sql<Member[]>`
					select persona_id, name from personas
				`;
				return {ok: true, value: data};
			},
			create: async (
				persona_id: number,
				community_id: number,
			): Promise<Result<{value: Member}>> => {
				const data = await this.sql<Member[]>`
					INSERT INTO persona_communities (persona_id, community_id) VALUES (
						${persona_id},${community_id}
					) RETURNING *			
				`;
				console.log('[db] created persona_communities', data);
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
				console.log(`[db] preparing to query for communities & spaces persona: ${account_id}`);
				const data = await this.sql<Community[]>`		
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
			insert: async (name: string, persona_id: number): Promise<Result<{value: Community}>> => {
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
					INSERT INTO persona_communities (persona_id, community_id) VALUES (
					${persona_id},${community_id}
					)
				`;
				console.log('[db] created persona_communities', association);
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
					select space_id, name, url, media_type, content from spaces where space_id = ${space_id}
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
					SELECT s.space_id, s.name, s.url, s.media_type, s.content FROM spaces s JOIN community_spaces cs ON s.space_id=cs.space_id AND cs.community_id= ${community_id}
				`;
				console.log('[db] spaces data', data);
				return {ok: true, value: data};
			},
			insert: async (
				community_id: number,
				params: SpaceParams,
			): Promise<Result<{value: Space}>> => {
				const {name, content, media_type, url} = params;
				const data = await this.sql<Space[]>`
					INSERT INTO spaces (name, url, media_type, content) VALUES (
						${name},${url},${media_type},${content}
					) RETURNING *
				`;
				console.log('[db] created space', data);
				const space_id: number = data[0].space_id;
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
				const spaces: Space[] = [];
				for (const space_params of default_spaces) {
					const result = await this.repos.spaces.insert(community_id, space_params);
					if (!result.ok)
						return {ok: false, reason: 'Failed to create default spaces for community.'};
					spaces.push(result.value);
				}
				console.log('[db] created default spaces', community_id, spaces);
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
