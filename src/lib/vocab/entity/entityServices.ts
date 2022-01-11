import type {Service} from '$lib/server/service';
import type {
	CreateEntityParams,
	CreateEntityResponseResult,
	ReadEntitiesParams,
	ReadEntitiesResponseResult,
} from '$lib/app/eventTypes';
import {ReadEntities, CreateEntity} from '$lib/vocab/entity/entity.events';

// TODO rename to `getEntities`? `loadEntities`?
export const readEntitiesService: Service<ReadEntitiesParams, ReadEntitiesResponseResult> = {
	event: ReadEntities,
	perform: async ({server, params}) => {
		const {db} = server;
		const findEntitiesResult = await db.repos.entity.filterBySpace(params.space_id);
		if (findEntitiesResult.ok) {
			return {ok: true, status: 200, value: {entities: findEntitiesResult.value}}; // TODO API types
		} else {
			console.log('[ReadEntities] error searching for entities');
			return {ok: false, status: 500, message: 'error searching for entities'};
		}
	},
};

export const createEntityService: Service<CreateEntityParams, CreateEntityResponseResult> = {
	event: CreateEntity,
	perform: async ({server, params}) => {
		// TODO security: validate `account_id` against the persona -- maybe as an optimized standalone method?
		// server.db.repos.account.validatePersona(account_id, actor_id);
		const insertEntitiesResult = await server.db.repos.entity.create(
			params.actor_id,
			params.space_id,
			params.content,
		);
		if (insertEntitiesResult.ok) {
			return {ok: true, status: 200, value: {entity: insertEntitiesResult.value}}; // TODO API types
		} else {
			console.log('[CreateEntity] error searching for entities');
			return {ok: false, status: 500, message: 'failed to create entity'};
		}
	},
};
