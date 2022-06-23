import {browser} from '$app/env';
import type {Entity} from '$lib/vocab/entity/entity';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import {derived, writable, type Readable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {LAST_SEEN_KEY} from './app';
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

//TODO this could probably a derived store (see above) based on something like "directoriesByCommunityId"
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

export const updateLastSeen = (ui: WritableUi, directory_id: number, time = Date.now()): void => {
	const {lastSeenByDirectoryId, entityById, spaceById} = ui;

	if (lastSeenByDirectoryId.has(directory_id)) {
		lastSeenByDirectoryId.get(directory_id)!.set(time);
	} else {
		lastSeenByDirectoryId.set(directory_id, writable(time));
	}

	if (browser) {
		localStorage.setItem(`${LAST_SEEN_KEY}${directory_id}`, `${time}`);
	}

	const directory = entityById.get(directory_id) as
		| Readable<Entity & {data: DirectoryEntityData}>
		| undefined;

	if (directory) {
		upsertCommunityFreshnessById(
			ui,
			//TODO add directory field to space & vice versa to avoid this mess below
			spaceById.get(directory.get().data.space_id)!.get().community_id,
		);
	}
};
