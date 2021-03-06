import {writable} from '@feltcoop/svelte-gettable-stores';

import type {Mutations} from '$lib/app/eventTypes';
import {
	deleteEntity,
	upsertEntity,
	updateEntityCaches,
	updateTieCaches,
} from '$lib/vocab/entity/entityMutationHelpers';

// TODO if `Create/Update/Erase` remain identical, probably make them use a single helper
// `updateEntity` or more likely `updateEntities`

export const CreateEntity: Mutations['CreateEntity'] = async ({invoke, params, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {tie, entity} = result.value;
	upsertEntity(ui, entity);
	updateEntityCaches(ui, entity, params.source_id);
	updateTieCaches(ui, tie);
	return result;
};

//TODO should this be UpdateEntities & batch?
export const UpdateEntity: Mutations['UpdateEntity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	upsertEntity(ui, result.value.entity);
	return result;
};

export const EraseEntities: Mutations['EraseEntities'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	for (const $entity of result.value.entities) {
		upsertEntity(ui, $entity);
	}
	return result;
};

export const DeleteEntities: Mutations['DeleteEntities'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {deletedEntityIds} = result.value;
	for (const entity_id of deletedEntityIds) {
		deleteEntity(ui, entity_id);
	}

	//TODO extract all this to a helper sibling like updateEntityCaches
	for (const spaceEntities of ui.entitiesBySourceId.values()) {
		// TODO this is very inefficient
		if (spaceEntities.get().find((e) => deletedEntityIds.includes(e.get().entity_id))) {
			spaceEntities.update(($s) =>
				$s.filter(($e) => !deletedEntityIds.includes($e.get().entity_id)),
			);
		}
	}

	return result;
};

export const ReadEntities: Mutations['ReadEntities'] = async ({invoke, params, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {ties, entities} = result.value;
	for (const $entity of entities) {
		upsertEntity(ui, $entity);
		updateEntityCaches(ui, $entity, params.source_id);
	}
	for (const $tie of ties) {
		updateTieCaches(ui, $tie);
	}
	return result;
};

// TODO implement this along with `ReadEntities` to use the same query and caching structures
export const ReadEntitiesPaginated: Mutations['ReadEntitiesPaginated'] = async ({
	invoke,
	ui,
	params,
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {ties, entities} = result.value;
	for (const $entity of entities) {
		upsertEntity(ui, $entity);
		updateEntityCaches(ui, $entity, params.source_id);
	}
	for (const $tie of ties) {
		updateTieCaches(ui, $tie);
	}
	return result;
};

//TODO rethink this caching element
export const QueryEntities: Mutations['QueryEntities'] = ({
	params,
	dispatch,
	ui: {entitiesBySourceId},
}) => {
	let spaceEntities = entitiesBySourceId.get(params.source_id);
	if (!spaceEntities) {
		entitiesBySourceId.set(params.source_id, (spaceEntities = writable([])));
		void dispatch.ReadEntities(params);
	}
	return spaceEntities;
};
