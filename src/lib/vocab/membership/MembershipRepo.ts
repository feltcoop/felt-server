import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Membership} from '$lib/vocab/membership/membership.js';
import type {ErrorResponse} from '$lib/util/error';

const log = new Logger(gray('[') + blue('MembershipRepo') + gray(']'));

export class MembershipRepo extends PostgresRepo {
	async create(
		persona_id: number,
		community_id: number,
	): Promise<Result<{value: Membership}, ErrorResponse>> {
		const data = await this.db.sql<Membership[]>`
			INSERT INTO memberships (persona_id, community_id) VALUES (
				${persona_id},${community_id}
			) RETURNING *
		`;
		log.trace('created membership', data[0]);
		return {ok: true, value: data[0]};
	}

	async findById(
		persona_id: number,
		community_id: number,
	): Promise<Result<{value: Membership}, {type: 'query_error'} & ErrorResponse>> {
		const data = await this.db.sql<Membership[]>`
			SELECT persona_id, community_id, created, updated
			FROM memberships
			WHERE ${persona_id}=persona_id AND ${community_id}=community_id
		`;
		if (data.length) {
			return {ok: true, value: data[0]};
		}
		return {
			ok: false,
			type: 'query_error',
			message: 'no membership found',
		};
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Membership[]}, ErrorResponse>> {
		log.trace(`[filterByAccount] ${account_id}`);
		const data = await this.db.sql<Membership[]>`
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

	async filterByCommunityId(
		community_id: number,
	): Promise<Result<{value: Membership[]}, ErrorResponse>> {
		log.trace(`[filterByCommunityId] ${community_id}`);
		const data = await this.db.sql<Membership[]>`
			SELECT m.persona_id, m.community_id, m.created, m.updated 
			FROM memberships m 
			WHERE m.community_id=${community_id};
		`;
		return {ok: true, value: data};
	}

	//TODO refactor once generic queries are available in psql driver
	async filterAccountPersonaMembershipsByCommunityId(
		community_id: number,
	): Promise<Result<{value: Membership[]}, ErrorResponse>> {
		log.trace(`[filterByCommunityId] ${community_id}`);
		const data = await this.db.sql<Membership[]>`
		SELECT m.persona_id, m.community_id, m.created, m.updated 
		FROM personas p JOIN (
				SELECT persona_id, community_id, created, updated 
				FROM memberships 
				WHERE community_id=${community_id}
			) as m ON m.persona_id = p.persona_id WHERE p.type = 'account';
		`;
		return {ok: true, value: data};
	}

	async deleteById(
		persona_id: number,
		community_id: number,
	): Promise<Result<{value: any[]}, {type: 'deletion_error'} & ErrorResponse>> {
		const data = await this.db.sql<any[]>`
			DELETE FROM memberships 
			WHERE ${persona_id}=persona_id AND ${community_id}=community_id
		`;
		if (data.count !== 1) {
			return {
				ok: false,
				type: 'deletion_error',
				message: 'failed to delete membership',
			};
		}
		return {ok: true, value: data};
	}
}
