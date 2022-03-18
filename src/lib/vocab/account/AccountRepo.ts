import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Account, AccountModel} from '$lib/vocab/account/account.js';
import type {ErrorResponse} from '$lib/util/error';
import {toPasswordKey} from '$lib/util/password';

const log = new Logger(gray('[') + blue('AccountRepo') + gray(']'));

export class AccountRepo extends PostgresRepo {
	async create(name: string, password: string): Promise<Result<{value: Account}, ErrorResponse>> {
		const passwordKey = await toPasswordKey(password);
		const data = await this.db.sql<Account[]>`
			INSERT INTO accounts (name, password) VALUES (
				${name}, ${passwordKey}
			) RETURNING *
		`;
		log.trace('created account', data[0]);
		const account = data[0];
		return {ok: true, value: account};
	}

	async findById(
		account_id: number,
	): Promise<Result<{value: AccountModel}, {type: 'no_account_found'} & ErrorResponse>> {
		log.trace('loading account', account_id);
		const data = await this.db.sql<AccountModel[]>`
			SELECT account_id, name, created, updated
			FROM accounts WHERE account_id = ${account_id}
		`;
		if (data.length) {
			log.trace('account found, returning', account_id);
			return {ok: true, value: data[0]};
		}
		return {
			ok: false,
			type: 'no_account_found',
			message: 'no account found',
		};
	}

	async findByName(
		name: string,
	): Promise<Result<{value: Account}, {type: 'no_account_found'} & ErrorResponse>> {
		const data = await this.db.sql<Account[]>`
			SELECT account_id, name, password, created, updated
			FROM accounts WHERE name = ${name}
		`;
		if (data.length) {
			return {ok: true, value: data[0]};
		}
		return {ok: false, type: 'no_account_found', message: 'no account found'};
	}
}
