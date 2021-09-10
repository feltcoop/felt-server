import type {Result} from '@feltcoop/felt';
import {unwrap} from '@feltcoop/felt';

import type {Database} from '$lib/db/Database';
import type {ClientAccountSession} from '$lib/session/clientSession.js';
import type {Persona} from '$lib/vocab/persona/persona.js';
import type {Community} from '$lib/vocab/community/community.js';
import type {Member} from '$lib/vocab/member/member.js';
import type {AccountModel} from '$lib/vocab/account/account.js';
import {accountModelProperties} from '$lib/vocab/account/account';

export const sessionRepo = (db: Database) => ({
	loadClientSession: async (account_id: number): Promise<Result<{value: ClientAccountSession}>> => {
		console.log('[db] loadClientSession', account_id);
		const account: AccountModel = unwrap(
			await db.repos.account.findById(account_id, accountModelProperties),
		);
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
