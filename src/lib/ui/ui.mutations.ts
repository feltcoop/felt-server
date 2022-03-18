import {goto} from '$app/navigation';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Mutations} from '$lib/app/mutationTypes';

const log = new Logger('[ui.mutations]');

export const Ping: Mutations['Ping'] = ({invoke}) => invoke();

// TODO BLOCK session mutations? session vocab?
export const LoginAccount: Mutations['LoginAccount'] = async ({invoke, ui: {session}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	session.set(result.value.session);
	return result;
};

export const LogoutAccount: Mutations['LogoutAccount'] = async ({invoke, ui: {session}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	session.set({guest: true});
	return result;
};

export const SetMobile: Mutations['SetMobile'] = ({params}) => {
	mobile.set(params);
};

export const OpenDialog: Mutations['OpenDialog'] = ({params}) => {
	dialogs.update(($dialogs) => $dialogs.concat(params));
};

export const CloseDialog: Mutations['CloseDialog'] = () => {
	dialogs.update(($dialogs) => $dialogs.slice(0, $dialogs.length - 1));
};

export const SelectPersona: Mutations['SelectPersona'] = ({params}) => {
	personaIdSelection.set(params.persona_id);
};

export const SelectCommunity: Mutations['SelectCommunity'] = ({params}) => {
	const $personaIdSelection = get(personaIdSelection); // TODO how to remove the `!`?
	const {community_id} = params;
	if (community_id && $personaIdSelection) {
		communityIdSelectionByPersonaId.update(($communityIdSelectionByPersonaId) => ({
			...$communityIdSelectionByPersonaId,
			[$personaIdSelection]: community_id,
		}));
	}
};

export const SelectSpace: Mutations['SelectSpace'] = ({params}) => {
	const {community_id, space_id} = params;
	spaceIdSelectionByCommunityId.update(($spaceIdSelectionByCommunityId) => ({
		...$spaceIdSelectionByCommunityId,
		[community_id]: space_id,
	}));
};

export const ViewSpace: Mutations['ViewSpace'] = async ({params: {space, view}}) => {
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

export const ToggleMainNav: Mutations['ToggleMainNav'] = () => {
	expandMainNav.update(($expandMainNav) => !$expandMainNav);
};

export const ToggleSecondaryNav: Mutations['ToggleSecondaryNav'] = () => {
	expandMarquee.update(($expandMarquee) => !$expandMarquee);
};
