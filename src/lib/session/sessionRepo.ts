import type {Result} from '@feltcoop/felt';
import {unwrap} from '@feltcoop/felt';

import type {Database} from '$lib/db/Database';
import type {ClientAccountSession} from '$lib/session/clientSession.js';
import type {Persona} from '$lib/vocab/persona/persona.js';
import type {Community} from '$lib/vocab/community/community.js';
import type {Member} from '$lib/vocab/member/member.js';
import {accountModelProperties} from '$lib/vocab/account/account';
import type {ErrorResponse} from '$lib/util/error';

export const sessionRepo = (db: Database) => ({
	loadClientSession: async (
		account_id: number,
	): Promise<Result<{value: ClientAccountSession}, {type: 'no_account_found'} & ErrorResponse>> => {
		console.log('[db] loadClientSession', account_id);
		const accountResult = await db.repos.account.findById(account_id, accountModelProperties);
		if (!accountResult.ok) {
			return accountResult;
		}
		const account = accountResult.value;
		// TODO instead of unwrapping these, handle errors for better UX
		let personas: Persona[] = unwrap(await db.repos.persona.filterByAccount(account.account_id));
		const communities: Community[] = unwrap(
			await db.repos.community.filterByAccount(account.account_id),
		);
		const members: Member[] = unwrap(await db.repos.member.getAll());
		return {
			ok: true,
			value: {account, personas, communities, members},
		};
	},
});
