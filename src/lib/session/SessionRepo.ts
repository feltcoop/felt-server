import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';

const log = new Logger(gray('[') + blue('SessionRepo') + gray(']'));

export class SessionRepo extends PostgresRepo {
	async loadClientSession(account_id: number): Promise<Result<{value: ClientAccountSession}>> {
		log.trace('loadClientSession', account_id);
		const accountResult = await this.db.repos.account.findById(account_id);
		if (!accountResult.ok) return accountResult;
		const account = accountResult.value;
		// TODO make this a single query
		const [personasResult, communitiesResult, spacesResult, membershipsResult, allPersonasResult] =
			await Promise.all([
				this.db.repos.persona.filterByAccount(account.account_id),
				this.db.repos.community.filterByAccount(account.account_id),
				this.db.repos.space.filterByAccount(account.account_id),
				this.db.repos.membership.filterByAccount(account.account_id),
				this.db.repos.persona.getAll(), //TODO don't getAll
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
	}
}
