import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Space} from '$lib/vocab/space/space';
import type {Entity} from '$lib/vocab/entity/entity';

const log = new Logger(gray('[') + blue('SessionRepo') + gray(']'));

export class SessionRepo extends PostgresRepo {
	async loadClientSession(account_id: number): Promise<Result<{value: ClientAccountSession}>> {
		log.trace('loadClientSession', account_id);
		const accountResult = await this.db.repos.account.findById(account_id);
		if (!accountResult.ok) return accountResult;
		const account = accountResult.value;

		const data = await this.db.sql<Array<{space: Space; entity: Entity}>>`
		SELECT json_build_object('space_id',s.space_id,'name',s.name,'url',s.url,'icon',s.icon,'view',s.view,'created',s.created,'updated',s.updated,'community_id',s.community_id,'directory_id',s.directory_id) space, 
		json_build_object('entity_id',e.entity_id,'data',e.data,'persona_id',e.persona_id,'created',e.created,'updated',e.updated) entity  
		FROM entities e JOIN (			     
		SELECT s.space_id, s.name, s.url, s.icon, s.view, s.created,s.updated, s.community_id, s.directory_id
						FROM spaces s JOIN (
							SELECT DISTINCT m.community_id FROM personas p
							JOIN memberships m ON p.persona_id=m.persona_id AND p.account_id=${account.account_id}
						) apc
						ON s.community_id=apc.community_id
		) s ON e.entity_id=s.directory_id;
			`;

		const spaces = data.map((r) => r.space);
		const directories = data.map((r) => r.entity);

		// TODO make this a single query
		const [sessionPersonasResult, communitiesResult, membershipsResult, personasResult] =
			await Promise.all([
				this.db.repos.persona.filterByAccount(account.account_id),
				this.db.repos.community.filterByAccount(account.account_id),
				this.db.repos.membership.filterByAccount(account.account_id),
				this.db.repos.persona.getAll(), //TODO don't getAll
			]);
		if (!sessionPersonasResult.ok) return sessionPersonasResult;
		if (!communitiesResult.ok) return communitiesResult;
		if (!membershipsResult.ok) return membershipsResult;
		if (!personasResult.ok) return personasResult;
		return {
			ok: true,
			value: {
				account,
				sessionPersonas: sessionPersonasResult.value,
				communities: communitiesResult.value,
				spaces,
				directories,
				memberships: membershipsResult.value,
				personas: personasResult.value,
			},
		};
	}
}
