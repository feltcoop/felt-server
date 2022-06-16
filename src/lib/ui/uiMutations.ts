import {goto} from '$app/navigation';
import {Logger} from '@feltcoop/felt/util/log.js';
import {round} from '@feltcoop/felt/util/maths.js';
import {browser} from '$app/env';
import {writable, type Readable} from '@feltcoop/svelte-gettable-stores';
import {LAST_SEEN_KEY} from '$lib/ui/app';

import type {Mutations} from '$lib/app/eventTypes';
import {upsertCommunityFreshnessById} from './uiMutationHelper';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {Entity} from '$lib/vocab/entity/entity';

const log = new Logger('[uiMutations]');

export const Ping: Mutations['Ping'] = async ({invoke}) => {
	const t = performance.now();
	const result = await invoke();
	const dt = performance.now() - t;
	log.info(`ping:`, round(dt, 1) + 'ms');
	return result;
};

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
	const $personaIdSelection = personaIdSelection.get();
	if ($personaIdSelection) {
		communityIdSelectionByPersonaId.mutate(($c) => {
			$c.set($personaIdSelection, params.community_id);
		});
	}
};

export const SelectSpace: Mutations['SelectSpace'] = ({
	params,
	ui: {spaceIdSelectionByCommunityId},
}) => {
	const {community_id, space_id} = params;
	spaceIdSelectionByCommunityId.mutate(($s) => {
		$s.set(community_id, space_id);
	});
};

export const ViewSpace: Mutations['ViewSpace'] = async ({
	params: {space_id, view},
	ui: {spaceById, viewBySpace, communitySelection, spaceIdSelectionByCommunityId, communityById},
}) => {
	const space = spaceById.get(space_id)!;
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
	const selectedCommunity = communitySelection.get();
	const $space = space.get();
	if (
		selectedCommunity &&
		$space.space_id !==
			spaceIdSelectionByCommunityId.get().value.get(selectedCommunity.get().community_id)
	) {
		const $community = communityById.get($space.community_id)!.get();
		await goto('/' + $community.name + $space.url + location.search, {replaceState: true});
	}
};

//TODO maybe turn this into a service event & make a server call too?
export const UpdateLastSeen: Mutations['UpdateLastSeen'] = async ({
	params: {directory_id, time},
	ui,
}) => {
	const {lastSeenByDirectoryId, entityById, spaceById} = ui;
	const timestamp = time ?? Date.now();

	if (lastSeenByDirectoryId.has(directory_id)) {
		lastSeenByDirectoryId.get(directory_id)!.set(timestamp);
	} else {
		lastSeenByDirectoryId.set(directory_id, writable(timestamp));
	}

	if (browser) {
		localStorage.setItem(`${LAST_SEEN_KEY}${directory_id}`, `${timestamp}`);
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

export const ToggleMainNav: Mutations['ToggleMainNav'] = ({ui: {expandMainNav}}) => {
	expandMainNav.update(($expandMainNav) => !$expandMainNav);
};

export const ToggleSecondaryNav: Mutations['ToggleSecondaryNav'] = ({ui: {expandMarquee}}) => {
	expandMarquee.update(($expandMarquee) => !$expandMarquee);
};
