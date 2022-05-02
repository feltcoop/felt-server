import {get, writable} from 'svelte/store';

import type {Mutations} from '$lib/app/eventTypes';
import {updateEntity} from '$lib/vocab/entity/entityMutationHelpers';

// TODO if `Create/Update/Erase` remain identical, probably make them use a single helper
// `updateEntity` or more likely `updateEntities`

export const CreateEntity: Mutations['CreateEntity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	updateEntity(ui, result.value.entity);
	return result;
};

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
	ui: {entityById, entitiesBySpace},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO update ties once stores are in place
	const {entity_ids} = params;
	for (const entity_id of entity_ids) {
		entityById.delete(entity_id);
	}
	for (const spaceEntities of entitiesBySpace.values()) {
		// TODO this is very inefficient
		if (get(spaceEntities).find((e) => entity_ids.includes(get(e).entity_id))) {
			spaceEntities.update(($s) => $s.filter(($e) => !entity_ids.includes(get($e).entity_id)));
		}
	}
	return result;
};

export const ReadEntities: Mutations['ReadEntities'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO update ties once stores are in place: `result.value.ties`
	for (const $entity of result.value.entities) {
		updateEntity(ui, $entity);
	}
	return result;
};

export const QueryEntities: Mutations['QueryEntities'] = ({
	params,
	dispatch,
	ui: {entitiesBySpace},
}) => {
	let spaceEntities = entitiesBySpace.get(params.space_id);
	if (!spaceEntities) {
		entitiesBySpace.set(params.space_id, (spaceEntities = writable([])));
		void dispatch.ReadEntities(params);
	}
	return spaceEntities;
};
