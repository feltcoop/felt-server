import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Community} from '$lib/vocab/community/community';

const log = new Logger(gray('[') + blue('CommunityRepo') + gray(']'));

export class CommunityRepo extends PostgresRepo {
	async create(
		type: Community['type'],
		name: string,
		settings: Community['settings'],
	): Promise<Result<{value: Community}>> {
		const data = await this.db.sql<Community[]>`
			INSERT INTO communities (type, name, settings) VALUES (
				${type}, ${name}, ${this.db.sql.json(settings)}
			) RETURNING *
		`;
		log.trace('[db] created community', data[0]);
		const community = data[0];
		return {ok: true, value: community};
	}

	async findById(community_id: number): Promise<Result<{value: Community}>> {
		log.trace(`[findById] ${community_id}`);
		const data = await this.db.sql<Community[]>`
			SELECT community_id, type, name, settings, created, updated
			FROM communities WHERE community_id=${community_id}
		`;
		// log.trace('[findById]', data);
		if (!data.length) {
			return {ok: false};
		}
		return {ok: true, value: data[0]};
	}

	async findByName(name: string): Promise<Result<{value: Community | undefined}>> {
		log.trace('[findByName]', name);
		const data = await this.db.sql<Community[]>`
			SELECT community_id, type, name, settings, created, updated
			FROM communities WHERE LOWER(name) = LOWER(${name})
		`;
		return {ok: true, value: data[0]};
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Community[]}>> {
		log.trace(`[filterByAccount] ${account_id}`);
		const data = await this.db.sql<Community[]>`
			SELECT c.community_id, c.type, c.name, c.settings, c.created, c.updated							
			FROM communities c JOIN (
				SELECT DISTINCT m.community_id FROM personas p
				JOIN memberships m ON p.persona_id=m.persona_id AND p.account_id = ${account_id}
			) apc
			ON c.community_id=apc.community_id;
		`;
		log.trace('[filterByAccount]', data.length);
		return {ok: true, value: data};
	}

	async updateSettings(community_id: number, settings: Community['settings']): Promise<Result> {
		const data = await this.db.sql<any[]>`
			UPDATE communities SET settings=${this.db.sql.json(settings)} WHERE community_id=${community_id}
		`;
		if (!data.count) {
			return {ok: false};
		}
		return {ok: true};
	}

	async deleteById(community_id: number): Promise<Result<object>> {
		log.trace('[deleteById]', community_id);
		const data = await this.db.sql<any[]>`
			DELETE FROM communities WHERE community_id=${community_id}
		`;
		if (!data.count) {
			return {ok: false};
		}
		return {ok: true};
	}
}
