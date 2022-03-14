import type {Service} from '$lib/server/service';
import type {
	CreateEntityParams,
	CreateEntityResponseResult,
	ReadEntitiesParams,
	ReadEntitiesResponseResult,
	UpdateEntityParams,
	UpdateEntityResponseResult,
	DeleteEntityParams,
	DeleteEntityResponseResult,
} from '$lib/app/eventTypes';
import {
	ReadEntities,
	UpdateEntity,
	CreateEntity,
	DeleteEntity,
} from '$lib/vocab/entity/entity.events';

// TODO rename to `getEntities`? `loadEntities`?
export const readEntitiesService: Service<ReadEntitiesParams, ReadEntitiesResponseResult> = {
	event: ReadEntities,
	perform: async ({repos, params}) => {
		const findEntitiesResult = await repos.entity.filterBySpace(params.space_id);
		if (findEntitiesResult.ok) {
			return {ok: true, status: 200, value: {entities: findEntitiesResult.value}}; // TODO API types
		}
		return {ok: false, status: 500, message: 'error searching for entities'};
	},
};

export const createEntityService: Service<CreateEntityParams, CreateEntityResponseResult> = {
	event: CreateEntity,
	perform: async ({repos, params}) => {
		// TODO security: validate `account_id` against the persona -- maybe as an optimized standalone method?
		const insertEntitiesResult = await repos.entity.create(
			params.actor_id,
			params.space_id,
			params.data,
		);
		if (insertEntitiesResult.ok) {
			return {ok: true, status: 200, value: {entity: insertEntitiesResult.value}}; // TODO API types
		}
		return {ok: false, status: 500, message: 'failed to create entity'};
	},
};

export const updateEntityService: Service<UpdateEntityParams, UpdateEntityResponseResult> = {
	event: UpdateEntity,
	perform: async ({repos, params}) => {
		// TODO security: validate `account_id` against the persona -- maybe as an optimized standalone method?
		const updateEntitiesResult = await repos.entity.updateEntityData(params.entity_id, params.data);
		if (updateEntitiesResult.ok) {
			return {ok: true, status: 200, value: {entity: updateEntitiesResult.value}}; // TODO API types
		}
		return {ok: false, status: 500, message: 'failed to update entity'};
	},
};

//deletes a single entity
export const deleteEntityService: Service<DeleteEntityParams, DeleteEntityResponseResult> = {
	event: DeleteEntity,
	perform: async ({repos, params}) => {
		const result = await repos.entity.deleteById(params.entity_id);
		if (!result.ok) {
			return {ok: false, status: 500, message: result.message};
		}
		return {ok: true, status: 200, value: null};
	},
};
