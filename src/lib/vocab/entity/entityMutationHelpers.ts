import {get, writable, type Writable} from 'svelte/store';

import type {WritableUi} from '$lib/ui/ui';
import type {Entity} from '$lib/vocab/entity/entity';

export const updateEntity = ({entityById}: WritableUi, $entity: Entity): Writable<Entity> => {
	const {entity_id} = $entity;
	let entity = entityById.get(entity_id);
	if (entity) {
		entity.set($entity);
	} else {
		entityById.set(entity_id, (entity = writable($entity)));
	}
	return entity;
};

export const updateEntityCaches = (
	{entityById, entitiesBySourceId}: WritableUi,
	$entity: Entity,
	source_id: number,
): Writable<Entity> => {
	const {entity_id} = $entity;
	const entity = entityById.get(entity_id)!;
	const existingSpaceEntities = entitiesBySourceId.get(source_id);
	if (existingSpaceEntities) {
		if (!get(existingSpaceEntities).includes(entity)) {
			existingSpaceEntities.update(($entities) => $entities.concat(entity));
		}
	} else {
		entitiesBySourceId.set(source_id, writable([entity]));
	}
	return entity;
};
