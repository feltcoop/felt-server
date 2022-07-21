import {NOT_OK, OK, type Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Membership} from '$lib/vocab/membership/membership.js';

const log = new Logger(gray('[') + blue('MembershipRepo') + gray(']'));

export class MembershipRepo extends PostgresRepo {
	async create(persona_id: number, community_id: number): Promise<Result<{value: Membership}>> {
		const data = await this.sql<Membership[]>`
			INSERT INTO memberships (persona_id, community_id) VALUES (
				${persona_id},${community_id}
			) RETURNING *
		`;
		log.trace('created membership', data[0]);
		return {ok: true, value: data[0]};
	}

	async findById(persona_id: number, community_id: number): Promise<Result<{value: Membership}>> {
		const data = await this.sql<Membership[]>`
			SELECT persona_id, community_id, created, updated
			FROM memberships
			WHERE ${persona_id}=persona_id AND ${community_id}=community_id
		`;
		if (!data.length) return NOT_OK;
		return {ok: true, value: data[0]};
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Membership[]}>> {
		log.trace(`[filterByAccount] ${account_id}`);
		const data = await this.sql<Membership[]>`
			SELECT m.persona_id, m.community_id, m.created, m.updated 
			FROM memberships m JOIN (
				SELECT DISTINCT m.community_id FROM personas p 
				JOIN memberships m 
				ON p.persona_id=m.persona_id AND p.account_id = ${account_id}
			) apc
			ON m.community_id=apc.community_id;
		`;
		return {ok: true, value: data};
	}

	async filterByCommunityId(community_id: number): Promise<Result<{value: Membership[]}>> {
		log.trace(`[filterByCommunityId] ${community_id}`);
		const data = await this.sql<Membership[]>`
			SELECT m.persona_id, m.community_id, m.created, m.updated 
			FROM memberships m 
			WHERE m.community_id=${community_id};
		`;
		return {ok: true, value: data};
	}

	//TODO refactor once generic queries are available in psql driver
	async filterAccountPersonaMembershipsByCommunityId(
		community_id: number,
	): Promise<Result<{value: Membership[]}>> {
		log.trace(`[filterByCommunityId] ${community_id}`);
		const data = await this.sql<Membership[]>`
			SELECT m.persona_id, m.community_id, m.created, m.updated 
			FROM personas p JOIN (
				SELECT persona_id, community_id, created, updated 
				FROM memberships 
				WHERE community_id=${community_id}
			) as m ON m.persona_id = p.persona_id WHERE p.type = 'account';
		`;
		return {ok: true, value: data};
	}

	async deleteById(persona_id: number, community_id: number): Promise<Result<object>> {
		const data = await this.sql<any[]>`
			DELETE FROM memberships 
			WHERE ${persona_id}=persona_id AND ${community_id}=community_id
		`;
		if (!data.count) return NOT_OK;
		return OK;
	}
}
