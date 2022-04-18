import {writable, get} from 'svelte/store';

import type {Mutations} from '$lib/app/eventTypes';

export const CreateEntity: Mutations['CreateEntity'] = async ({invoke, ui: {entitiesBySpace}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {entity: $entity} = result.value;
	let entity = writable($entity);
	const spaceEntities = entitiesBySpace.get($entity.space_id);
	if (spaceEntities) {
		// TODO check if it already exists -- maybe by getting `entityStore` from a `entityById` map
		spaceEntities.update(($entities) => $entities.concat(entity));
	} else {
		entitiesBySpace.set($entity.space_id, writable([entity]));
	}
	return result;
};

export const UpdateEntity: Mutations['UpdateEntity'] = async ({invoke, ui: {entityById}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO maybe return to $entity naming convention OR propagate this pattern?
	const {entity: updatedEntity} = result.value;
	const entity = entityById.get(updatedEntity.entity_id);
	if (!entity) return result; // TODO BLOCK add this, use the same code paths as `QueryEntities`
	entity.set(updatedEntity);
	// TODO BLOCK remove from `entitiesBySpace` if needed -- how to determine if it belongs?
	return result;
};

export const SoftDeleteEntity: Mutations['SoftDeleteEntity'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//update state here

	//TODO add store updates once new entity/tie stores are in place
	return result;
};

export const DeleteEntities: Mutations['DeleteEntities'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//update state here

	//TODO add store updates once new entity/tie stores are in place
	return result;
};

export const ReadEntities: Mutations['ReadEntities'] = async ({
	params,
	invoke,
	ui: {entitiesBySpace, entityById},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space_id} = params;
	const existingSpaceEntities = entitiesBySpace.get(space_id);
	// TODO BLOCK add to `entityById`, use same code path as `UpdateEntity`
	// TODO probably check to make sure they don't already exist
	const newFiles = result ? result.value.entities.map((f) => writable(f)) : [];
	if (existingSpaceEntities) {
		existingSpaceEntities.set(newFiles);
	} else {
		entitiesBySpace.set(space_id, writable(newFiles));
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
