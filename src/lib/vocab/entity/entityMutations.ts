import {writable} from 'svelte/store';

import type {Mutations} from '$lib/app/eventTypes';
import {updateEntity} from '$lib/vocab/entity/entityMutationHelpers';

// TODO if `Create/Update/Erase` remain identical, probably make them use a single helper

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

export const EraseEntity: Mutations['EraseEntity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	updateEntity(ui, result.value.entity);
	return result;
};

export const DeleteEntities: Mutations['DeleteEntities'] = async ({
	invoke,
	params,
	ui: {entityById},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	// TODO delete entities from `entitiesBySpace` (should they be sets instead of arrays?)
	//TODO update ties once stores are in place
	for (const entity_id of params.entity_ids) {
		entityById.delete(entity_id);
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
