import {NOT_OK, OK, type Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Space} from '$lib/vocab/space/space.js';
import type {Entity} from '$lib/vocab/entity/entity';

const log = new Logger(gray('[') + blue('SpaceRepo') + gray(']'));

export class SpaceRepo extends PostgresRepo {
	async findById(space_id: number): Promise<Result<{value: Space}>> {
		log.trace(`[findById] ${space_id}`);
		const data = await this.db.sql<Space[]>`
			SELECT space_id, name, url, icon, view, updated, created, community_id, directory_id
			FROM spaces WHERE space_id=${space_id}
		`;
		log.trace('[findById] result', data);
		if (!data.length) return NOT_OK;
		return {ok: true, value: data[0]};
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Space[]}>> {
		log.trace('[filterByAccount]', account_id);
		const data = await this.db.sql<Space[]>`
			SELECT s.space_id, s.name, s.url, icon, s.view, s.updated, s.created, s.community_id, s.directory_id
			FROM spaces s JOIN (
				SELECT DISTINCT m.community_id FROM personas p
				JOIN memberships m ON p.persona_id=m.persona_id AND p.account_id=${account_id}
			) apc
			ON s.community_id=apc.community_id;
		`;
		return {ok: true, value: data};
	}

	async filterByAccountWithDirectories(
		account_id: number,
	): Promise<Result<{value: Array<{space: Space; entity: Entity}>}>> {
		const data = await this.db.sql<Array<{space: Space; entity: Entity}>>`
		SELECT json_build_object('space_id',s.space_id,'name',s.name,'url',s.url,'icon',s.icon,'view',s.view,'created',s.created,'updated',s.updated,'community_id',s.community_id,'directory_id',s.directory_id) space, 
		json_build_object('entity_id',e.entity_id,'data',e.data,'persona_id',e.persona_id,'created',e.created,'updated',e.updated) entity  
		FROM entities e JOIN (			     
		SELECT s.space_id, s.name, s.url, s.icon, s.view, s.created,s.updated, s.community_id, s.directory_id
						FROM spaces s JOIN (
							SELECT DISTINCT m.community_id FROM personas p
							JOIN memberships m ON p.persona_id=m.persona_id AND p.account_id=${account_id}
						) apc
						ON s.community_id=apc.community_id
		) s ON e.entity_id=s.directory_id;
			`;
		return {ok: true, value: data};
	}

	async filterByCommunity(community_id: number): Promise<Result<{value: Space[]}>> {
		log.trace('[filterByCommunity]', community_id);
		const data = await this.db.sql<Space[]>`
			SELECT space_id, name, url, icon, view, updated, created, community_id, directory_id
			FROM spaces WHERE community_id=${community_id}
		`;
		return {ok: true, value: data};
	}

	async findByCommunityUrl(
		community_id: number,
		url: string,
	): Promise<Result<{value: Space | undefined}>> {
		log.trace('[findByCommunityUrl]', community_id, url);
		const data = await this.db.sql<Space[]>`
			SELECT space_id, name, url, icon, view, updated, created, community_id, directory_id
			FROM spaces WHERE community_id=${community_id} AND url=${url}
		`;
		log.trace('[findByCommunityUrl] result', data);
		return {ok: true, value: data[0]};
	}

	async create(
		name: string,
		view: string,
		url: string,
		icon: string,
		community_id: number,
		directory_id: number,
	): Promise<Result<{value: Space}>> {
		const data = await this.db.sql<Space[]>`
			INSERT INTO spaces (name, url, icon, view, community_id, directory_id) VALUES (
				${name},${url},${icon},${view},${community_id}, ${directory_id}
			) RETURNING *
		`;
		return {ok: true, value: data[0]};
	}

	async update(
		space_id: number,
		partial: Partial<Pick<Space, 'name' | 'url' | 'icon' | 'view'>>,
	): Promise<Result<{value: Space}>> {
		log.trace(`updating data for space: ${space_id}`);
		const data = await this.db.sql<Space[]>`
			UPDATE spaces
			SET updated=NOW(), ${this.db.sql(partial as any, ...Object.keys(partial))}
			WHERE space_id= ${space_id}
			RETURNING *
		`;
		if (!data.count) return NOT_OK;
		return {ok: true, value: data[0]};
	}

	async deleteById(space_id: number): Promise<Result<object>> {
		log.trace('[deleteById]', space_id);
		const data = await this.db.sql<any[]>`
			DELETE FROM spaces WHERE space_id=${space_id}
		`;
		if (!data.count) return NOT_OK;
		return OK;
	}
}
