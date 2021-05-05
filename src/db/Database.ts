import type {Result} from '@feltcoop/gro';
import {unwrap} from '@feltcoop/gro';

import type {AccountSession} from '../session/clientSession.js';
import type {Community} from '../communities/community.js';
import type {Space} from '../spaces/space.js';
import type {Account} from '../vocab/account/account.js';
import type {Entity} from '../vocab/entity/entity.js';
import type {PostgresSql} from './postgres.js';

export interface Options {
	sql: PostgresSql;
}

//TODO create seperate models used by the front end (w/ camelCase attributes) from the repo models
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

	// TODO declaring like this is weird, should be static, but not sure what interface is best
	repos = {
		session: {
			loadClientSession: async (name: string): Promise<Result<{value: AccountSession}>> => {
				console.log('[db] loadClientSession', name);
				let account: Account = unwrap(await this.repos.accounts.findByName(name));
				let communities: Community[] = unwrap(
					await this.repos.communities.filterByAccount(account.account_id!),
				);
				let entities: Entity[] = unwrap(await this.repos.entities.findByAccount(name));
				return {
					ok: true,
					value: {account, communities, entities},
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
			findByName: async (
				name: string,
			): Promise<
				Result<
					{value: Account},
					{type: 'invalidName'; reason: string} | {type: 'noAccountFound'; reason: string}
				>
			> => {
				const data = await this.sql<Account[]>`
				select account_id, name, password from accounts where name = ${name}
				`;
				if (data.length) {
					return {ok: true, value: data[0]};
				}
				return {ok: false, type: 'noAccountFound', reason: `No account found with name: ${name}`};
			},
		},
		entities: {
			findByAccount: async (
				name: string,
			): Promise<
				Result<
					{value: Entity[]},
					{type: 'invalidName'; reason: string} | {type: 'noAccountFound'; reason: string}
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
			findById: async (
				community_id: string,
			): Promise<Result<{value: Community[]}, {type: 'noCommunityFound'; reason: string}>> => {
				console.log(`[db] preparring to query for community id: ${community_id}`);
				const data = await this.sql<Community[]>`
				select community_id, name from communities where community_id = ${community_id}
				`;
				console.log('[db] community data', data);
				if (data.length) {
					return {ok: true, value: data};
				}
				return {
					ok: false,
					type: 'noCommunityFound',
					reason: `No community found with id: ${community_id}`,
				};
			},
			filterByAccount: async (accountId: number): Promise<Result<{value: Community[]}>> => {
				console.log(`[db] preparring to query for communities & spaces account: ${accountId}`);
				const data = await this.sql<Community[]>`		
  					select c.community_id, c.name,
    				(
      				select array_to_json(coalesce(array_agg(row_to_json(d)), '{}'))
      				from (
        				SELECT s.space_id, s.url, s.media_type, s.content FROM spaces s JOIN community_spaces cs ON s.space_id=cs.space_id AND cs.community_id=c.community_id      				
      				) d
    				) as spaces
  				from communities c JOIN account_communities ac
  				ON c.community_id=ac.community_id AND ac.account_id=${accountId}				
				`;
				console.log('[db] community data', data);
				return {ok: true, value: data};
			},
		},
		spaces: {
			findById: async (
				spaceId: string,
			): Promise<Result<{value: Space[]}, {type: 'noSpaceFound'; reason: string}>> => {
				console.log(`[db] preparring to query for space id: ${spaceId}`);
				const data = await this.sql<Space[]>`
				select space_id, url, media_type, content from spaces where space_id = ${spaceId}
				`;
				console.log('[db] space data', data);
				if (data.length) {
					return {ok: true, value: data};
				}
				return {
					ok: false,
					type: 'noSpaceFound',
					reason: `No space found with id: ${spaceId}`,
				};
			},
			filterByCommunity: async (communityId: string): Promise<Result<{value: Space[]}>> => {
				console.log(`[db] preparring to query for community spaces: ${communityId}`);
				const data = await this.sql<Space[]>`
				SELECT s.space_id, s.url, s.media_type, s.content FROM spaces s JOIN community_spaces cs ON s.space_id=cs.space_id AND cs.community_id= ${communityId}
				`;
				console.log('[db] community data', data);
				return {ok: true, value: data};
			},
		},
	};
}
