import {goto} from '$app/navigation';
import {get} from 'svelte/store';

import type {Mutations} from '$lib/app/eventTypes';

export const Ping: Mutations['Ping'] = ({invoke}) => invoke();

export const SetMobile: Mutations['SetMobile'] = ({params, ui: {mobile}}) => {
	mobile.set(params);
};

export const OpenDialog: Mutations['OpenDialog'] = ({params, ui: {dialogs}}) => {
	dialogs.update(($dialogs) => $dialogs.concat(params));
};

export const CloseDialog: Mutations['CloseDialog'] = ({ui: {dialogs}}) => {
	dialogs.update(($dialogs) => $dialogs.slice(0, $dialogs.length - 1));
};

export const SelectPersona: Mutations['SelectPersona'] = ({params, ui: {personaIdSelection}}) => {
	personaIdSelection.set(params.persona_id);
};

export const SelectCommunity: Mutations['SelectCommunity'] = ({
	params,
	ui: {personaIdSelection, communityIdSelectionByPersonaId},
}) => {
	const $personaIdSelection = get(personaIdSelection);
	const {community_id} = params; // TODO BLOCK should this be nullable? if so, then so should `communityIdSelectionByPersonaId`
	if (community_id && $personaIdSelection) {
		communityIdSelectionByPersonaId.mutate(($c) => {
			$c.set($personaIdSelection, community_id);
		});
	}
};

export const SelectSpace: Mutations['SelectSpace'] = ({
	params,
	ui: {spaceIdSelectionByCommunityId},
}) => {
	const {community_id, space_id} = params;
	spaceIdSelectionByCommunityId.update(($spaceIdSelectionByCommunityId) => ({
		...$spaceIdSelectionByCommunityId,
		[community_id]: space_id,
	}));
};

export const ViewSpace: Mutations['ViewSpace'] = async ({
	params: {space, view},
	ui: {viewBySpace, communitySelection, spaceIdSelectionByCommunityId, communityById},
}) => {
	viewBySpace.mutate(($viewBySpace) => {
		if (view) {
			$viewBySpace.set(space, view);
		} else {
			$viewBySpace.delete(space);
		}
	});
	// Navigate the browser to the target space.
	// The target community may not match the selected community,
	// so it's not as simple as checking if this is already the selected space for its community,
	// we need to check if the selected community's selected space matches this space.
	const selectedCommunity = get(communitySelection);
	const $space = get(space);
	if (
		selectedCommunity &&
		$space.space_id !== get(spaceIdSelectionByCommunityId)[get(selectedCommunity).community_id]
	) {
		const $community = get(communityById.get($space.community_id)!);
		await goto('/' + $community.name + $space.url + location.search, {replaceState: true});
	}
};

export const ToggleMainNav: Mutations['ToggleMainNav'] = ({ui: {expandMainNav}}) => {
	expandMainNav.update(($expandMainNav) => !$expandMainNav);
};

export const ToggleSecondaryNav: Mutations['ToggleSecondaryNav'] = ({ui: {expandMarquee}}) => {
	expandMarquee.update(($expandMarquee) => !$expandMarquee);
};
