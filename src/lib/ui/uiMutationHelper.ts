import type {Entity} from '$lib/vocab/entity/entity';
import {derived, writable, type Writable} from '@feltcoop/svelte-gettable-stores';
import type {WritableUi} from './ui';

export const setFreshnessDerived = (ui: WritableUi, directory: Writable<Entity>): void => {
	const {freshnessByDirectoryId, lastSeenByDirectoryId} = ui;
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
};

export const upsertCommunityFreshnessById = (ui: WritableUi, community_id: number): void => {
	const {spacesByCommunityId, freshnessByCommunityId, freshnessByDirectoryId} = ui;
	const spaces = spacesByCommunityId.get().get(community_id) || [];
	const fresh = spaces.some((s) => freshnessByDirectoryId.get(s.get().directory_id)!.get());
	if (freshnessByCommunityId.has(community_id)) {
		freshnessByCommunityId.get(community_id)!.set(fresh);
	} else {
		freshnessByCommunityId.set(community_id, writable(fresh));
	}
};
