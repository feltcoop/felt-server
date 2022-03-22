import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Space} from '$lib/vocab/space/space.js';
import {toDefaultSpaces} from '$lib/vocab/space/defaultSpaces';
import type {ErrorResponse} from '$lib/util/error';
import type {Community} from '$lib/vocab/community/community';
import type {ViewData} from '$lib/vocab/view/view';

const log = new Logger(gray('[') + blue('SpaceRepo') + gray(']'));

export class SpaceRepo extends PostgresRepo {
	async findById(
		space_id: number,
	): Promise<Result<{value: Space}, {type: 'no_space_found'} & ErrorResponse>> {
		log.trace(`[findById] ${space_id}`);
		const data = await this.db.sql<Space[]>`
			SELECT space_id, name, url, icon, view, updated, created, community_id
			FROM spaces WHERE space_id=${space_id}
		`;
		log.trace('[findById] result', data);
		if (data.length) {
			return {ok: true, value: data[0]};
		}
		return {
			ok: false,
			type: 'no_space_found',
			message: 'no space found',
		};
	}

	async filterByAccount(account_id: number): Promise<Result<{value: Space[]}, ErrorResponse>> {
		log.trace('[filterByAccount]', account_id);
		const data = await this.db.sql<Space[]>`
			SELECT s.space_id, s.name, s.url, icon, s.view, s.updated, s.created, s.community_id
			FROM spaces s JOIN (
				SELECT DISTINCT m.community_id FROM personas p
				JOIN memberships m ON p.persona_id=m.persona_id AND p.account_id=${account_id}
			) apc
			ON s.community_id=apc.community_id;
		`;
		return {ok: true, value: data};
	}

	async filterByCommunity(community_id: number): Promise<Result<{value: Space[]}>> {
		log.trace('[filterByCommunity]', community_id);
		const data = await this.db.sql<Space[]>`
			SELECT space_id, name, url, icon, view, updated, created, community_id
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
			SELECT space_id, name, url, icon, view, updated, created, community_id
			FROM spaces WHERE community_id=${community_id} AND url=${url}
		`;
		log.trace('[findByCommunityUrl] result', data);
		return {ok: true, value: data[0]};
	}

	async create(
		name: string,
		view: ViewData,
		url: string,
		icon: string,
		community_id: number,
	): Promise<Result<{value: Space}>> {
		const data = await this.db.sql<Space[]>`
			INSERT INTO spaces (name, url, icon, view, community_id) VALUES (
				${name},${url},${icon},${this.db.sql.json(view)},${community_id}
			) RETURNING *
		`;
		return {ok: true, value: data[0]};
	}

	async createDefaultSpaces(
		community: Community,
	): Promise<Result<{value: Space[]}, ErrorResponse>> {
		const spaces: Space[] = [];
		for (const params of toDefaultSpaces(community)) {
			// TODO parallelize this and remove the eslint override, but how to preserve order?
			// `db.repos.space.createMany`?
			// eslint-disable-next-line no-await-in-loop
			const result = await this.create(
				params.name,
				params.view,
				params.url,
				params.icon,
				params.community_id,
			);
			if (!result.ok) return {ok: false, message: 'failed to create default spaces'};
			spaces.push(result.value);
		}
		return {ok: true, value: spaces};
	}

	async update(
		space_id: number,
		partial: Partial<Pick<Space, 'name' | 'url' | 'icon' | 'view'>>,
	): Promise<Result<{value: Space}, ErrorResponse>> {
		log.trace(`updating data for space: ${space_id}`);
		// TODO hacky, fix when `postgres` v2 is out with dynamic queries
		const updated: Record<string, any> = {};
		for (const [key, value] of Object.entries(partial)) {
			updated[key] = value && typeof value === 'object' ? JSON.stringify(value) : value;
		}
		log.trace(`updated`, updated);
		const result = await this.db.sql<Space[]>`
			UPDATE spaces
			SET updated=NOW(), ${this.db.sql(updated, ...Object.keys(updated))}
			WHERE space_id= ${space_id}
			RETURNING *
		`;
		if (!result.count) {
			return {ok: false, message: 'failed to update space'};
		}
		return {ok: true, value: result[0]};
	}

	async deleteById(
		space_id: number,
	): Promise<Result<object, {type: 'deletion_error'} & ErrorResponse>> {
		log.trace('[deleteById]', space_id);
		const data = await this.db.sql<any[]>`
			DELETE FROM spaces WHERE space_id=${space_id}
		`;
		if (data.count !== 1) {
			return {
				ok: false,
				type: 'deletion_error',
				message: 'failed to delete space',
			};
		}
		return {ok: true};
	}
}
