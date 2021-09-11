import type {Result} from '@feltcoop/felt';

import type {Account, AccountParams} from '$lib/vocab/account/account.js';
import {accountProperties} from '$lib/vocab/account/account';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

export const accountRepo = (db: Database) => ({
	create: async ({
		name,
		password,
	}: AccountParams): Promise<Result<{value: Account}, ErrorResponse>> => {
		const data = await db.sql<Account[]>`
      insert into accounts (name, password) values (
        ${name}, ${password}
      ) RETURNING *`;
		console.log('[db] created account', data);
		const account = data[0];
		return {ok: true, value: account};
	},
	findById: async (
		account_id: number,
		columns: string[] = accountProperties,
	): Promise<Result<{value: Account}, {type: 'no_account_found'} & ErrorResponse>> => {
		const data = await db.sql<Account[]>`
      select ${db.sql(columns)} from accounts where account_id = ${account_id}
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
	findByName: async (
		name: string,
	): Promise<Result<{value: Account}, {type: 'no_account_found'} & ErrorResponse>> => {
		const data = await db.sql<Account[]>`
      select account_id, name, password from accounts where name = ${name}
    `;
		if (data.length) {
			return {ok: true, value: data[0]};
		}
		return {ok: false, type: 'no_account_found', reason: `No account found with name: ${name}`};
	},
});
