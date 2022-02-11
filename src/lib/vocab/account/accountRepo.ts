import type {Result} from '@feltcoop/felt';

import type {Account, AccountModel} from '$lib/vocab/account/account.js';
import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';
import {toPasswordKey} from '$lib/util/password';

export const accountRepo = (db: Database) =>
	({
		create: async (
			name: string,
			password: string,
		): Promise<Result<{value: Account}, ErrorResponse>> => {
			const passwordKey = await toPasswordKey(password);
			const data = await db.sql<Account[]>`
				INSERT INTO accounts (name, password) VALUES (
					${name}, ${passwordKey}
				) RETURNING *
			`;
			console.log('[db] created account', data[0]);
			const account = data[0];
			return {ok: true, value: account};
		},
		findById: async (
			account_id: number,
		): Promise<Result<{value: AccountModel}, {type: 'no_account_found'} & ErrorResponse>> => {
			console.log('[accountRepo] loading account', account_id);
			const data = await db.sql<AccountModel[]>`
				SELECT account_id, name, created, updated FROM accounts WHERE account_id = ${account_id}
			`;
			if (data.length) {
				console.log('[accountRepo] account found, returning', account_id);
				return {ok: true, value: data[0]};
			}
			return {
				ok: false,
				type: 'no_account_found',
				message: 'no account found',
			};
		},
		findByName: async (
			name: string,
		): Promise<Result<{value: Account}, {type: 'no_account_found'} & ErrorResponse>> => {
			const data = await db.sql<Account[]>`
				SELECT account_id, name, password, created, updated FROM accounts WHERE name = ${name}
			`;
			if (data.length) {
				return {ok: true, value: data[0]};
			}
			return {ok: false, type: 'no_account_found', message: 'no account found'};
		},
	} as const);
