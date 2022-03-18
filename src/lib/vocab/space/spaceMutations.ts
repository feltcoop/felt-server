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
	ui: {communities, spaceIdSelectionByCommunityId, spacesByCommunityId, spaceById, spaces},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	//update state here
	const {space_id} = params;
	get(communities).value.forEach((community) => {
		// TODO maybe make a nav helper or event?
		const $community = get(community);
		// TODO this should only nav for the active community, otherwise update just update the spaceIdSelectionByCommunityId
		if (space_id === get(spaceIdSelectionByCommunityId)[$community.community_id]) {
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			goto(
				'/' +
					$community.name +
					get(get(spacesByCommunityId).get($community.community_id)![0]).url +
					location.search,
				{replaceState: true},
			);
		}
	});

	const space = spaceById.get(space_id)!;
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
