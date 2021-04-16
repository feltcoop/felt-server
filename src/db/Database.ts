import type {Result} from '@feltcoop/gro';
import {unwrap} from '@feltcoop/gro';

import type {UserSession} from '../session/clientSession.js';
import type {Community} from '../communities/community.js';
import type {User} from '../vocab/user/user.js';
import type {Entity} from '../vocab/entity/entity.js';
import type {PostgresSql} from './postgres.js';

export interface Options {
	sql: PostgresSql;
}

export class Database {
	sql: PostgresSql;

	constructor({sql}: Options) {
		console.log('[db] create');
		this.sql = sql;
	}

	async close(): Promise<void> {
		console.log('[db] destroy');
		await this.sql.end();
	}

	// TODO declaring like this is weird, should be static, but not sure what interface is best
	repos = {
		session: {
			loadClientSession: async (name: string): Promise<UserSession> => {
				console.log('[db] loadClientSession', name);
				return {
					user: unwrap(await this.repos.users.findByName(name)),
					entities: unwrap(await this.repos.entities.findByUser(name)),
				};
			},
		},
		users: {
			create: async (
				name: string,
				password: string,
			): Promise<Result<{value: User}, {reason: string}>> => {
				const user = {name, password};
				const data = await this.sql`
				insert into accounts (name, password) values (
					${name}, ${password}
				)`;
				console.log(data);
				return {ok: true, value: user};
			},
			findByName: async (
				name: string,
			): Promise<
				Result<
					{value: User},
					{type: 'invalidName'; reason: string} | {type: 'noAccountFound'; reason: string}
				>
			> => {
				const data = await this.sql<User[]>`
				select account_id, name, password from accounts where name = ${name}
				`;
				if (data.length) {
					return {ok: true, value: data[0]};
				}
				return {ok: false, type: 'noAccountFound', reason: `No user found with name: ${name}`};
			},
		},
		entities: {
			findByUser: async (
				name: string,
			): Promise<
				Result<
					{value: Entity[]},
					{type: 'invalidName'; reason: string} | {type: 'noUserFound'; reason: string}
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
			filterByAccount: async (
				account: User,
			): Promise<Result<{value: Community[]}, {type: 'noCommunitiesFound'; reason: string}>> => {
				console.log(`[db] preparring to query for communities account: ${account.name}`);
				//TODO make this actually use the account data
				const data = await this.sql<Community[]>`
				SELECT c.community_id, c.name FROM communities c JOIN account_communities ac ON c.community_id=ac.community_id AND ac.account_id=1
				`;
				console.log('[db] community data', data);
				if (data.length) {
					return {ok: true, value: data};
				}
				return {
					ok: false,
					type: 'noCommunitiesFound',
					reason: `No communities found for account: ${account}`,
				};
			},
		},
	};
}
