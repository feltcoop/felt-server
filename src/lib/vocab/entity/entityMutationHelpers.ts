import {writable, mutable, type Writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Dispatch} from '$lib/app/eventTypes';
import type {Tie} from '$lib/vocab/tie/tie';

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

export const updateTieCaches = (
	{sourceTiesByDestEntityId, destTiesBySourceEntityId}: WritableUi,
	$tie: Tie,
): void => {
	const $sourceTiesByDestEntityId = sourceTiesByDestEntityId.get().value;
	//TODO this mutablity may be better served by a LookupTiesHelper
	let sourceTies = $sourceTiesByDestEntityId.get($tie.dest_id);
	if (!sourceTies) {
		sourceTiesByDestEntityId.mutate(($v) => {
			$v.set($tie.dest_id, (sourceTies = mutable([])));
		});
	}
	const $sourceTies = sourceTies!.get().value;
	if (
		!$sourceTies.find(
			($t) =>
				$t.dest_id === $tie.dest_id && $t.source_id === $tie.source_id && $t.type === $tie.type,
		)
	) {
		sourceTies!.mutate(($v) => $v.push($tie));
	}

	const $destTiesBySourceEntityId = destTiesBySourceEntityId.get().value;
	//TODO this mutablity may be better served by a LookupTiesHelper
	let destTies = $destTiesBySourceEntityId.get($tie.source_id);
	if (!destTies) {
		destTiesBySourceEntityId.mutate(($v) => {
			$v.set($tie.source_id, (destTies = mutable([])));
		});
	}
	const $destTies = destTies!.get().value;
	if (
		!$destTies.find(
			($t) =>
				$t.dest_id === $tie.dest_id && $t.source_id === $tie.source_id && $t.type === $tie.type,
		)
	) {
		destTies!.mutate(($v) => $v.push($tie));
	}
};
