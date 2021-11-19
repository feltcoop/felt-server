import type {Result} from '@feltcoop/felt';

import type {Account, AccountModel, CreateAccountParams} from '$lib/vocab/account/account.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';
import {toPasswordKey} from '$lib/util/password';

export const accountRepo = (db: Database) => ({
	create: async ({
		name,
		password,
	}: CreateAccountParams): Promise<Result<{value: Account}, ErrorResponse>> => {
		const passwordKey = await toPasswordKey(password);
		const data = await db.sql<Account[]>`
      insert into accounts (name, password) values (
        ${name}, ${passwordKey}
      ) RETURNING *`;
		console.log('[db] created account', data);
		const account = data[0];
		return {ok: true, value: account};
	},
	findById: async (
		account_id: number,
	): Promise<Result<{value: AccountModel}, {type: 'no_account_found'} & ErrorResponse>> => {
		console.log('[accountRepo] loading account', account_id);
		const data = await db.sql<AccountModel[]>`
      select account_id, name, created, updated from accounts where account_id = ${account_id}
    `;
		if (data.length) {
			console.log('[accountRepo] account found, returning', account_id);
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
      select account_id, name, password, created, updated from accounts where name = ${name}
    `;
		if (data.length) {
			return {ok: true, value: data[0]};
		}
		return {ok: false, type: 'no_account_found', reason: `No account found with name: ${name}`};
	},
});
