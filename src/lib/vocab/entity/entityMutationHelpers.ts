import {writable, type Writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Dispatch} from '$lib/app/eventTypes';

export const updateEntity = (
	{entityById, spaceSelection}: WritableUi,
	dispatch: Dispatch,
	$entity: Entity,
): Writable<Entity> => {
	const {entity_id} = $entity;
	let entity = entityById.get(entity_id);
	if (entity) {
		entity.set($entity);
	} else {
		entityById.set(entity_id, (entity = writable($entity)));
	}
	if (spaceSelection.get()?.get().directory_id === $entity.entity_id) {
		//TODO having dispatch here may be a code smell; need to rethink either passing full event context or adding listeners
		dispatch.UpdateLastSeen({directory_id: $entity.entity_id, time: $entity.updated!.getTime()});
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
		if (!existingSpaceEntities.get().includes(entity)) {
			existingSpaceEntities.update(($entities) =>
				// TODO splice into a mutable array instead of sorting like this
				$entities.concat(entity).sort((a, b) => (a.get().created > b.get().created ? 1 : -1)),
			);
		}
	} else {
		entitiesBySourceId.set(source_id, writable([entity]));
	}
	return entity;
};
