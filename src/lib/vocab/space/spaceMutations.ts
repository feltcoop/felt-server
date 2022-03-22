import {writable, get} from 'svelte/store';
import {goto} from '$app/navigation';

import type {Mutations} from '$lib/app/eventTypes';

export const CreateSpace: Mutations['CreateSpace'] = async ({invoke, ui: {spaceById, spaces}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {space: $space} = result.value;
	const space = writable($space);
	spaceById.set($space.space_id, space);
	spaces.mutate(($spaces) => $spaces.push(space));
	return result;
};

export const DeleteSpace: Mutations['DeleteSpace'] = async ({
	params,
	invoke,
	ui: {
		communityById,
		spaceIdSelectionByCommunityId,
		spacesByCommunityId,
		spaceById,
		spaces,
		communitySelection,
	},
}) => {
	const result = await invoke();
	if (!result.ok) return result;

	const {space_id} = params;
	const space = spaceById.get(space_id)!;
	const $space = get(space);
	const {community_id} = $space;
	const $spaceIdSelectionByCommunityId = get(spaceIdSelectionByCommunityId);

	// If the deleted space is selected, select the home space as a fallback.
	if (space_id === $spaceIdSelectionByCommunityId[community_id]) {
		const community = communityById.get(community_id)!;
		if (community === get(communitySelection)) {
			await goto('/' + get(community).name + location.search, {replaceState: true});
		} else {
			//TODO lookup space by community_id+url (see this comment in multiple places)
			const homeSpace = get(spacesByCommunityId)
				.get(community_id)!
				.find((s) => get(s).url === '/')!;
			spaceIdSelectionByCommunityId.update(($v) => ({
				...$v,
				[community_id]: get(homeSpace).space_id,
			}));
		}
	}

	spaceById.delete(space_id);
	spaces.mutate(($spaces) => $spaces.splice($spaces.indexOf(space), 1));

	return result;
};

export const UpdateSpace: Mutations['UpdateSpace'] = async ({invoke, params, ui: {spaceById}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//TODO maybe return to $entity naming convention OR propagate this pattern?
	const {space: updatedSpace} = result.value;
	const space = spaceById.get(params.space_id);
	space!.set(updatedSpace);
	return result;
};
