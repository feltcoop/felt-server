import {writable, mutable, type Writable} from '@feltcoop/svelte-gettable-stores';

import type {WritableUi} from '$lib/ui/ui';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Dispatch} from '$lib/app/eventTypes';
import type {Tie} from '$lib/vocab/tie/tie';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import {upsertCommunityFreshnessById} from '$lib/ui/uiMutationHelper';

export const updateEntity = (
	ui: WritableUi,
	dispatch: Dispatch,
	$entity: Entity,
): Writable<Entity> => {
	const {entityById, spaceSelection, spaceById} = ui;
	const {entity_id} = $entity;
	let entity = entityById.get(entity_id);
	if (entity) {
		entity.set($entity);
	} else {
		entityById.set(entity_id, (entity = writable($entity)));
	}

	const entityData = entity.get().data as DirectoryEntityData;

	if (entityData.space_id) {
		upsertCommunityFreshnessById(ui, spaceById.get(entityData.space_id)!.get().community_id);
	}

	if (spaceSelection.get()?.get().directory_id === $entity.entity_id) {
		//TODO turn UpdateLastSeen into mutation helper & change event to "ClearFreshness"
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

export const evictTiesForEntity = (
	{sourceTiesByDestEntityId, destTiesBySourceEntityId}: WritableUi,
	entity_id: number,
): void => {
	const sources = sourceTiesByDestEntityId.get().value.get(entity_id);
	if (sources) {
		for (const source of sources.get().value) {
			const ties = destTiesBySourceEntityId.get().value.get(source.source_id);
			if (ties) {
				ties.mutate(($ties) => {
					for (let i = $ties.length - 1; i >= 0; i--) {
						if ($ties[i].dest_id === entity_id) $ties.splice(i, 1);
					}
				});
			}
		}
		sourceTiesByDestEntityId.mutate(($v) => $v.delete(entity_id));
	}

	const destinations = destTiesBySourceEntityId.get().value.get(entity_id);
	if (destinations) {
		for (const dest of destinations.get().value) {
			const ties = sourceTiesByDestEntityId.get().value.get(dest.dest_id);
			if (ties) {
				ties.mutate(($ties) => {
					for (let i = $ties.length - 1; i >= 0; i--) {
						if ($ties[i].source_id === entity_id) $ties.splice(i, 1);
					}
				});
			}
		}
		destTiesBySourceEntityId.mutate(($v) => $v.delete(entity_id));
	}
};

export const evictTie = (
	{sourceTiesByDestEntityId, destTiesBySourceEntityId}: WritableUi,
	source_id: number,
	dest_id: number,
	type: string,
): void => {
	const sources = sourceTiesByDestEntityId.get().value.get(dest_id);
	if (sources) {
		sources.mutate(($sources) => {
			for (let i = $sources.length - 1; i >= 0; i--) {
				const sourceTie = $sources[i];
				if (sourceTie.source_id === source_id && sourceTie.type === type) $sources.splice(i, 1);
			}
		});
		if (sources.get().value.length === 0) {
			sourceTiesByDestEntityId.mutate(($v) => {
				$v.delete(dest_id);
			});
		}
	}

	const destinations = destTiesBySourceEntityId.get().value.get(source_id);
	if (destinations) {
		destinations.mutate(($destinations) => {
			for (let i = $destinations.length - 1; i >= 0; i--) {
				const destTie = $destinations[i];
				if (destTie.dest_id === dest_id && destTie.type === type) $destinations.splice(i, 1);
			}
		});
		if (destinations.get().value.length === 0) {
			destTiesBySourceEntityId.mutate(($v) => {
				$v.delete(source_id);
			});
		}
	}
};

export const deleteEntity = (ui: WritableUi, entity_id: number): void => {
	const {entityById, freshnessByDirectoryId} = ui;
	entityById.delete(entity_id);
	freshnessByDirectoryId.delete(entity_id);
	evictTiesForEntity(ui, entity_id);
};
