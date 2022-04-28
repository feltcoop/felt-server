import type {ServicesByName} from '$lib/app/eventTypes';
import {
	ReadEntities,
	ReadEntitiesPaginated,
	UpdateEntity,
	CreateEntity,
	EraseEntity,
	DeleteEntities,
} from '$lib/vocab/entity/entityEvents';
import {toTieEntityIds} from '$lib/vocab/tie/tieHelpers';

// TODO rename to `getEntities`? `loadEntities`?
export const readEntitiesService: ServicesByName['ReadEntities'] = {
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
		const entityIds = toTieEntityIds(findTiesResult.value);
		entityIds.delete(findSpaceResult.value.directory_id);
		const findEntitiesResult = await repos.entity.filterByIds(Array.from(entityIds));
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

export const ReadEntitiesPaginatedService: ServicesByName['ReadEntitiesPaginated'] = {
	event: ReadEntitiesPaginated,
	perform: async ({repos, params}) => {
		const findTiesResult = await repos.tie.filterBySourceIdPaginated(
			params.source_id,
			params.pageSize,
			params.pageKey,
		);
		if (!findTiesResult.ok) {
			return {ok: false, status: 500, message: 'error searching directory'};
		}
		//TODO stop filtering directory until we fix entity indexing by space_id
		const entityIds = toTieEntityIds(findTiesResult.value);
		entityIds.delete(params.source_id);
		const findEntitiesResult = await repos.entity.filterByIds(Array.from(entityIds));
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

export const createEntityService: ServicesByName['CreateEntity'] = {
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

export const updateEntityService: ServicesByName['UpdateEntity'] = {
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
export const eraseEntityService: ServicesByName['EraseEntity'] = {
	event: EraseEntity,
	perform: async ({repos, params}) => {
		const result = await repos.entity.eraseById(params.entity_id);
		if (!result.ok) {
			return {ok: false, status: 500, message: 'failed to soft delete entity'};
		}
		return {ok: true, status: 200, value: null};
	},
};

//hard deletes a single entity, removing the record of it from the DB
export const deleteEntitiesService: ServicesByName['DeleteEntities'] = {
	event: DeleteEntities,
	perform: async ({repos, params}) => {
		const result = await repos.entity.deleteByIds(params.entity_ids);
		if (!result.ok) {
			return {ok: false, status: 500, message: 'failed to delete entity'};
		}
		return {ok: true, status: 200, value: null};
	},
};
