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
	DeleteEntitiesParams,
	DeleteEntitiesResponseResult,
} from '$lib/app/eventTypes';
import {
	ReadEntities,
	UpdateEntity,
	CreateEntity,
	SoftDeleteEntity,
	DeleteEntities,
} from '$lib/vocab/entity/entityEvents';

// TODO rename to `getEntities`? `loadEntities`?
export const readEntitiesService: Service<ReadEntitiesParams, ReadEntitiesResponseResult> = {
	event: ReadEntities,
	perform: async ({repos, params}) => {
		const findEntitiesResult = await repos.entity.filterBySpace(params.space_id);
		if (!findEntitiesResult.ok) {
			return {ok: false, status: 500, message: 'error searching for entities'};
		}
		return {ok: true, status: 200, value: {entities: findEntitiesResult.value}};
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
export const deleteEntitiesService: Service<DeleteEntitiesParams, DeleteEntitiesResponseResult> = {
	event: DeleteEntities,
	perform: async ({repos, params}) => {
		const result = await repos.entity.deleteByIdSet(params.entity_ids);
		if (!result.ok) {
			return {ok: false, status: 500, message: 'failed to delete entity'};
		}
		return {ok: true, status: 200, value: null};
	},
};
