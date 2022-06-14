import type {Entity} from '$lib/vocab/entity/entity';
import {derived, type Writable} from '@feltcoop/svelte-gettable-stores';
import type {WritableUi} from './ui';

export const setFreshnessDerived = (ui: WritableUi, directory: Writable<Entity>): void => {
	const {freshnessByDirectoryId, lastSeenByDirectoryId, freshnessByCommunityId} = ui;
	const {entity_id} = directory.get();
	const lastSeen = lastSeenByDirectoryId.get(entity_id);
	if (!lastSeen) throw Error(`no lastSeenByDirectoryId for directory:${entity_id}`);
	if (freshnessByDirectoryId.has(entity_id)) throw Error(`derived already exists dir:${entity_id}`);

	freshnessByDirectoryId.set(
		entity_id,
		derived([directory, lastSeen], ([$directory, $lastSeen]) => {
			return $lastSeen < ($directory.updated ?? $directory.created).getTime();
		}),
	);

	//for a community, get all spaces
	//for each space, find freshness
	//if at least 1 is fresh, set community fresh
};
