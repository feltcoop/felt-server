import type {ServiceByName} from '$lib/app/eventTypes';
import {
	ReadEntities,
	ReadEntitiesPaginated,
	UpdateEntity,
	CreateEntity,
	EraseEntities,
	DeleteEntities,
} from '$lib/vocab/entity/entityEvents';
import {toTieEntityIds} from '$lib/vocab/tie/tieHelpers';

// TODO rename to `getEntities`? `loadEntities`?
export const ReadEntitiesService: ServiceByName['ReadEntities'] = {
	event: ReadEntities,
	perform: async ({repos, params}) => {
		const findTiesResult = await repos.tie.filterBySourceId(params.source_id);
		if (!findTiesResult.ok) {
			return {ok: false, status: 500, message: 'error searching space directory'};
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

export const ReadEntitiesPaginatedService: ServiceByName['ReadEntitiesPaginated'] = {
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

export const CreateEntityService: ServiceByName['CreateEntity'] = {
	event: CreateEntity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			// TODO security: validate `account_id` against the persona -- maybe as an optimized standalone method?
			const insertEntitiesResult = await repos.entity.create(params.persona_id, params.data);
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

			return {
				ok: true,
				status: 200,
				value: {entity: insertEntitiesResult.value, tie: insertTieResult.value},
			};
		}),
};

export const UpdateEntityService: ServiceByName['UpdateEntity'] = {
	event: UpdateEntity,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			// TODO security: validate `account_id` against the persona -- maybe as an optimized standalone method?
			const updateEntitiesResult = await repos.entity.updateEntityData(
				params.entity_id,
				params.data,
			);
			if (!updateEntitiesResult.ok) {
				return {ok: false, status: 500, message: 'failed to update entity'};
			}
			return {ok: true, status: 200, value: {entity: updateEntitiesResult.value}};
		}),
};

//soft deletes a single entity, leaving behind a Tombstone entity
export const EraseEntitiesService: ServiceByName['EraseEntities'] = {
	event: EraseEntities,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const result = await repos.entity.eraseByIds(params.entityIds);
			if (!result.ok) {
				return {ok: false, status: 500, message: 'failed to soft delete entity'};
			}
			return {ok: true, status: 200, value: {entities: result.value}};
		}),
};

//hard deletes one to many entities, removing the records from the DB
export const DeleteEntitiesService: ServiceByName['DeleteEntities'] = {
	event: DeleteEntities,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			const deletedEntityIds: number[] = [];
			const result = await repos.entity.deleteByIds(params.entityIds);
			if (!result.ok) {
				return {ok: false, status: 500, message: 'failed to delete entity'};
			}
			deletedEntityIds.push(...params.entityIds);

			// Deleting one entity may orphan others, so loop until there are no more orphans.
			while (true) {
				const orphans = await repos.entity.findOrphanedEntities(); // eslint-disable-line no-await-in-loop
				if (!orphans.ok) {
					return {ok: false, status: 500, message: 'failed to find orphans'};
				}
				if (orphans.value.length === 0) {
					break;
				}
				const deletedOrphans = await repos.entity.deleteByIds(orphans.value); // eslint-disable-line no-await-in-loop
				if (!deletedOrphans.ok) {
					return {ok: false, status: 500, message: 'failed to delete orphans'};
				}
				deletedEntityIds.push(...orphans.value);
			}

			return {ok: true, status: 200, value: {deletedEntityIds}};
		}),
};
