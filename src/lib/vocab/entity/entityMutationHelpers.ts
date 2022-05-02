import {get, writable, type Writable} from 'svelte/store';

import type {WritableUi} from '$lib/ui/ui';
import type {Entity} from '$lib/vocab/entity/entity';

export const updateEntity = (
	{entityById, entitiesBySpace}: WritableUi,
	$entity: Entity,
): Writable<Entity> => {
	const {entity_id} = $entity;
	let entity = entityById.get(entity_id);
	if (entity) {
		entity.set($entity);
	} else {
		entityById.set(entity_id, (entity = writable($entity)));
	}
	const existingSpaceEntities = entitiesBySpace.get($entity.space_id);
	if (existingSpaceEntities) {
		if (!get(existingSpaceEntities).includes(entity)) {
			existingSpaceEntities.update(($entities) => $entities.concat(entity!));
		}
	} else {
		entitiesBySpace.set($entity.space_id, writable([entity]));
	}
	return entity;
};
