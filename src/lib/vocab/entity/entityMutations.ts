import {writable} from 'svelte/store';

import type {Mutations} from '$lib/app/eventTypes';
import {addEntity} from '$lib/vocab/entity/entityMutationHelpers';

export const CreateEntity: Mutations['CreateEntity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {entity: $entity} = result.value;
	addEntity(ui, $entity);
	return result;
};

export const UpdateEntity: Mutations['UpdateEntity'] = async ({invoke, ui}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO maybe return to $entity naming convention OR propagate this pattern?
	const {entity: updatedEntity} = result.value;
	const entity = ui.entityById.get(updatedEntity.entity_id);
	if (entity) {
		entity.set(updatedEntity);
	} else {
		addEntity(ui, updatedEntity);
	}
	return result;
};

export const SoftDeleteEntity: Mutations['SoftDeleteEntity'] = async ({
	invoke,
	// params,
	// ui: {entityById},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO update ties once stores are in place
	// TODO return the updated value so it can be set to exactly what the server has (or use a toTombstone helper?)
	// const entity = entityById.get(params.entity_id)!;
	// entity.set(result.value);
	return result;
};

export const DeleteEntities: Mutations['DeleteEntities'] = async ({
	invoke,
	params,
	ui: {entityById},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
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
		addEntity(ui, $entity);
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
