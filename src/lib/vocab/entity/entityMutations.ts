import {get, writable} from 'svelte/store';

import type {Mutations} from '$lib/app/eventTypes';
import {updateEntity, updateEntityCaches} from '$lib/vocab/entity/entityMutationHelpers';

// TODO if `Create/Update/Erase` remain identical, probably make them use a single helper
// `updateEntity` or more likely `updateEntities`

export const CreateEntity: Mutations['CreateEntity'] = async ({invoke, params, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	updateEntity(ui, result.value.entity);
	updateEntityCaches(ui, result.value.entity, params.source_id);
	return result;
};

//TODO should this be UpdateEntities & batch?
export const UpdateEntity: Mutations['UpdateEntity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	updateEntity(ui, result.value.entity);
	return result;
};

export const EraseEntities: Mutations['EraseEntities'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	for (const $entity of result.value.entities) {
		updateEntity(ui, $entity);
	}
	return result;
};

export const DeleteEntities: Mutations['DeleteEntities'] = async ({
	invoke,
	params,
	ui: {entityById, entitiesBySourceId},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO update ties once stores are in place
	const {entity_ids} = params;
	for (const entity_id of entity_ids) {
		entityById.delete(entity_id);
	}
	//TODO extract all this to a helper sibling like updateEntityCaches
	for (const spaceEntities of entitiesBySourceId.values()) {
		// TODO this is very inefficient
		if (get(spaceEntities).find((e) => entity_ids.includes(get(e).entity_id))) {
			spaceEntities.update(($s) => $s.filter(($e) => !entity_ids.includes(get($e).entity_id)));
		}
	}
	return result;
};

export const ReadEntities: Mutations['ReadEntities'] = async ({invoke, params, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO update ties once stores are in place: `result.value.ties`
	for (const $entity of result.value.entities) {
		updateEntity(ui, $entity);
		updateEntityCaches(ui, $entity, params.source_id);
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
