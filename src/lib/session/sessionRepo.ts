import type {Result} from '@feltcoop/felt';

import type {Database} from '$lib/db/Database';
import type {ClientAccountSession} from '$lib/session/clientSession.js';
import {accountModelProperties} from '$lib/vocab/account/account';
import type {ErrorResponse} from '$lib/util/error';

export const sessionRepo = (db: Database) => ({
	loadClientSession: async (
		account_id: number,
	): Promise<
		Result<{value: ClientAccountSession}, {type?: 'no_account_found'} & ErrorResponse>
	> => {
		console.log('[db] loadClientSession', account_id);
		const accountResult = await db.repos.account.findById(account_id, accountModelProperties);
		if (!accountResult.ok) return accountResult;
		const account = accountResult.value;
		// TODO make this a single query
		const [personasResult, communitiesResult, membershipsResult] = await Promise.all([
			db.repos.persona.filterByAccount(account.account_id),
			db.repos.community.filterByAccount(account.account_id),
			db.repos.member.getAll(),
		]);
		if (!personasResult.ok) return personasResult;
		if (!communitiesResult.ok) return communitiesResult;
		if (!membershipsResult.ok) return membershipsResult;
		return {
			ok: true,
			value: {
				account,
				personas: personasResult.value,
				communities: communitiesResult.value,
				members: membershipsResult.value,
			},
		};
	},
});
