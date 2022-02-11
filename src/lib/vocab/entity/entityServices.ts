import type {Service} from '$lib/server/service';
import type {
	CreateEntityParams,
	CreateEntityResponseResult,
	ReadEntitiesParams,
	ReadEntitiesResponseResult,
	UpdateEntityParams,
	UpdateEntityResponseResult,
} from '$lib/app/eventTypes';
import {ReadEntities, UpdateEntity, CreateEntity} from '$lib/vocab/entity/entity.events';

// TODO rename to `getEntities`? `loadEntities`?
export const readEntitiesService: Service<ReadEntitiesParams, ReadEntitiesResponseResult> = {
	event: ReadEntities,
	perform: async ({repos, params}) => {
		const findEntitiesResult = await repos.entity.filterBySpace(params.space_id);
		if (findEntitiesResult.ok) {
			return {ok: true, status: 200, value: {entities: findEntitiesResult.value}}; // TODO API types
		}
		console.log('[ReadEntities] error searching for entities');
		return {ok: false, status: 500, message: 'error searching for entities'};
	},
};

export const createEntityService: Service<CreateEntityParams, CreateEntityResponseResult> = {
	event: CreateEntity,
	perform: async ({repos, params}) => {
		// TODO security: validate `account_id` against the persona -- maybe as an optimized standalone method?
		// server.db.repos.account.validatePersona(account_id, actor_id);
		const insertEntitiesResult = await repos.entity.create(
			params.actor_id,
			params.space_id,
			params.data,
		);
		if (insertEntitiesResult.ok) {
			return {ok: true, status: 200, value: {entity: insertEntitiesResult.value}}; // TODO API types
		}
		console.log('[CreateEntity] error searching for entities');
		return {ok: false, status: 500, message: 'failed to create entity'};
	},
};

export const updateEntityService: Service<UpdateEntityParams, UpdateEntityResponseResult> = {
	event: UpdateEntity,
	perform: async ({repos, params}) => {
		// TODO security: validate `account_id` against the persona -- maybe as an optimized standalone method?
		// server.db.repos.account.validatePersona(account_id, actor_id);
		const updateEntitiesResult = await repos.entity.updateEntityData(params.entity_id, params.data);
		if (updateEntitiesResult.ok) {
			return {ok: true, status: 200, value: {entity: updateEntitiesResult.value}}; // TODO API types
		}
		console.log('[UpdateEntity] error updating entity');
		return {ok: false, status: 500, message: 'failed to update entity'};
	},
};
