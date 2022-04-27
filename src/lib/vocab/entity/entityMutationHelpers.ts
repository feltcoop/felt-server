import {writable, type Writable} from 'svelte/store';

import type {WritableUi} from '$lib/ui/ui';
import type {Entity} from '$lib/vocab/entity/entity';

export const addEntity = (
	{entityById, entitiesBySpace}: WritableUi,
	$entity: Entity,
): Writable<Entity> => {
	const {entity_id} = $entity;
	if (entityById.has(entity_id)) {
		// TODO BLOCK is this the logic we want? or keep going but de-dupe?
		throw Error('TODO ?');
		// return entityById.get(entity_id)!;
	}
	const entity = writable($entity);
	entityById.set(entity_id, entity);
	const existingSpaceEntities = entitiesBySpace.get($entity.space_id);
	if (existingSpaceEntities) {
		existingSpaceEntities.update(($entities) =>
			$entities.includes(entity) ? $entities : $entities.concat(entity),
		);
	} else {
		entitiesBySpace.set($entity.space_id, writable([entity]));
	}
	return entity;
};
