import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import type {Database} from '$lib/db/Database';
import type {ErrorResponse} from '$lib/util/error';

const log = new Logger(gray('[') + blue('sessionRepo') + gray(']'));

export const sessionRepo = (db: Database) =>
	({
		loadClientSession: async (
			account_id: number,
		): Promise<
			Result<{value: ClientAccountSession}, {type?: 'no_account_found'} & ErrorResponse>
		> => {
			log.trace('loadClientSession', account_id);
			const accountResult = await db.repos.account.findById(account_id);
			if (!accountResult.ok) return accountResult;
			const account = accountResult.value;
			// TODO make this a single query
			const [
				personasResult,
				communitiesResult,
				spacesResult,
				membershipsResult,
				allPersonasResult,
			] = await Promise.all([
				db.repos.persona.filterByAccount(account.account_id),
				db.repos.community.filterByAccount(account.account_id),
				db.repos.space.filterByAccount(account.account_id),
				db.repos.membership.filterByAccount(account.account_id),
				db.repos.persona.getAll(), //TODO don't getAll
			]);
			if (!personasResult.ok) return personasResult;
			if (!communitiesResult.ok) return communitiesResult;
			if (!spacesResult.ok) return spacesResult;
			if (!membershipsResult.ok) return membershipsResult;
			if (!allPersonasResult.ok) return allPersonasResult;
			return {
				ok: true,
				value: {
					account,
					personas: personasResult.value,
					communities: communitiesResult.value,
					spaces: spacesResult.value,
					memberships: membershipsResult.value,
					allPersonas: allPersonasResult.value,
				},
			};
		},
	} as const);
