import type {Result} from '@feltcoop/felt';
import {unwrap} from '@feltcoop/felt';

import type {Database} from '$lib/db/Database';
import type {ClientAccountSession} from '$lib/session/client_session.js';
import type {Persona} from '$lib/vocab/persona/persona.js';
import type {Community} from '$lib/vocab/community/community.js';
import type {Member} from '$lib/vocab/member/member.js';
import type {AccountModel} from '$lib/vocab/account/account.js';
import {account_model_properties} from '$lib/vocab/account/account';

export const sessionRepo = (db: Database) => ({
	load_client_session: async (
		account_id: number,
	): Promise<Result<{value: ClientAccountSession}>> => {
		console.log('[db] load_client_session', account_id);
		const account: AccountModel = unwrap(
			await db.repos.account.find_by_id(account_id, account_model_properties),
		);
		let personas: Persona[] = unwrap(await db.repos.persona.filter_by_account(account.account_id));
		const communities: Community[] = unwrap(
			await db.repos.community.filter_by_account(account.account_id),
		);
		const members: Member[] = unwrap(await db.repos.member.get_all());
		return {
			ok: true,
			value: {account, personas, communities, members},
		};
	},
});
