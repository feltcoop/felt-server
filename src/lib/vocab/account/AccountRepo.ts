import {NOT_OK, type Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Account, AccountModel} from '$lib/vocab/account/account.js';
import {toPasswordKey} from '$lib/util/password';

const log = new Logger(gray('[') + blue('AccountRepo') + gray(']'));

export class AccountRepo extends PostgresRepo {
	async create(name: string, password: string): Promise<Result<{value: Account}>> {
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

	async findById(account_id: number): Promise<Result<{value: AccountModel}>> {
		log.trace('loading account', account_id);
		const data = await this.db.sql<AccountModel[]>`
			SELECT account_id, name, created, updated
			FROM accounts WHERE account_id = ${account_id}
		`;
		if (!data.length) return NOT_OK;
		return {ok: true, value: data[0]};
	}

	async findByName(name: string): Promise<Result<{value: Account}>> {
		const data = await this.db.sql<Account[]>`
			SELECT account_id, name, password, created, updated
			FROM accounts WHERE name = ${name}
		`;
		if (!data.length) return NOT_OK;
		return {ok: true, value: data[0]};
	}
}
