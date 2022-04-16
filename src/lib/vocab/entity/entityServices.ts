import type {Service} from '$lib/server/service';
import type {
	CreateEntityParams,
	CreateEntityResponseResult,
	ReadEntitiesParams,
	ReadEntitiesResponseResult,
	UpdateEntityParams,
	UpdateEntityResponseResult,
	SoftDeleteEntityParams,
	SoftDeleteEntityResponseResult,
	HardDeleteEntityParams,
	HardDeleteEntityResponseResult,
} from '$lib/app/eventTypes';
import {
	ReadEntities,
	UpdateEntity,
	CreateEntity,
	SoftDeleteEntity,
	HardDeleteEntity,
} from '$lib/vocab/entity/entityEvents';

// TODO rename to `getEntities`? `loadEntities`?
export const readEntitiesService: Service<ReadEntitiesParams, ReadEntitiesResponseResult> = {
	event: ReadEntities,
	perform: async ({repos, params}) => {
		// could update the interface to just expect the client to provide the dir id
		// but didn't want to mess with the interface for now.
		const findSpaceResult = await repos.space.findById(params.space_id);
		if (!findSpaceResult.ok) {
			return {ok: false, status: 500, message: 'error looking up space'};
		}
		const findTiesResult = await repos.tie.filterBySourceId(findSpaceResult.value.directory_id);
		if (!findTiesResult.ok) {
			return {ok: false, status: 500, message: 'error searching space directory'};
		}
		//TODO stop filtering directory until we fix entity indexing by space_id
		const entitySet = findTiesResult.value.flatMap((t) =>
			[t.source_id, t.dest_id].filter((x) => x !== findSpaceResult.value.directory_id),
		);
		const findEntitiesResult = await repos.entity.findBySet(entitySet);
		if (!findEntitiesResult.ok) {
			return {ok: false, status: 500, message: 'error searching for entities'};
		}
		return {
			ok: true,
			status: 200,
			value: {entities: findEntitiesResult.value, ties: findTiesResult.value},
		};
	},
};

export const createEntityService: Service<CreateEntityParams, CreateEntityResponseResult> = {
	event: CreateEntity,
	perform: async ({repos, params}) => {
		// TODO security: validate `account_id` against the persona -- maybe as an optimized standalone method?
		const insertEntitiesResult = await repos.entity.create(
			params.actor_id,
			params.data,
			params.space_id,
		);
		if (!insertEntitiesResult.ok) {
			return {ok: false, status: 500, message: 'failed to create entity'};
		}

		const insertTieResult = await repos.tie.create(
			params.source_id,
			insertEntitiesResult.value.entity_id,
			params.type ? params.type : 'HasItem',
		);

		if (!insertTieResult.ok) {
			return {ok: false, status: 500, message: 'failed to tie entity to graph'};
		}

		return {ok: true, status: 200, value: {entity: insertEntitiesResult.value}};
	},
};

export const updateEntityService: Service<UpdateEntityParams, UpdateEntityResponseResult> = {
	event: UpdateEntity,
	perform: async ({repos, params}) => {
		// TODO security: validate `account_id` against the persona -- maybe as an optimized standalone method?
		const updateEntitiesResult = await repos.entity.updateEntityData(params.entity_id, params.data);
		if (!updateEntitiesResult.ok) {
			return {ok: false, status: 500, message: 'failed to update entity'};
		}
		return {ok: true, status: 200, value: {entity: updateEntitiesResult.value}};
	},
};

//soft deletes a single entity, leaving behind a Tombstone entity
export const softDeleteEntityService: Service<
	SoftDeleteEntityParams,
	SoftDeleteEntityResponseResult
> = {
	event: SoftDeleteEntity,
	perform: async ({repos, params}) => {
		const result = await repos.entity.softDeleteById(params.entity_id);
		if (!result.ok) {
			return {ok: false, status: 500, message: 'failed to soft delete entity'};
		}
		return {ok: true, status: 200, value: null};
	},
};

//hard deletes a single entity, removing the record of it from the DB
export const hardDeleteEntityService: Service<
	HardDeleteEntityParams,
	HardDeleteEntityResponseResult
> = {
	event: HardDeleteEntity,
	perform: async ({repos, params}) => {
		const result = await repos.entity.hardDeleteById(params.entity_id);
		if (!result.ok) {
			return {ok: false, status: 500, message: 'failed to delete entity'};
		}
		return {ok: true, status: 200, value: null};
	},
};
