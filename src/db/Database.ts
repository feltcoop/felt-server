import type {Result} from '@feltcoop/gro';
import {unwrap} from '@feltcoop/gro';

import type {AccountSession} from '../session/clientSession.js';
import type {Community} from '../communities/community.js';
import type {Account} from '../vocab/account/account.js';
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
				console.log(`[db] preparring to query for communities account: ${accountId}`);
				const data = await this.sql<Community[]>`
				SELECT c.community_id, c.name FROM communities c JOIN account_communities ac ON c.community_id=ac.community_id AND ac.account_id= ${accountId}
				`;
				console.log('[db] community data', data);
				return {ok: true, value: data};
			},
		},
	};
}
