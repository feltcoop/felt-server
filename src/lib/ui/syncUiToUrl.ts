import type {Readable} from 'svelte/store';
import {get} from 'svelte/store';
import {browser} from '$app/env';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Persona} from '$lib/vocab/persona/persona';
import {goto} from '$app/navigation';
import {PERSONA_QUERY_KEY, setUrlPersona} from '$lib/ui/url';
import type {Dispatch} from '$lib/app/eventTypes';
import type {Ui} from '$lib/ui/ui';

const log = new Logger('[syncUiToUrl]');

// TODO instead of dispatching `select` events on startup, initialize with correct values

export const syncUiToUrl = (
	{
		communities,
		personaIndexSelection,
		communityIdSelection,
		spacesByCommunityId,
		spaceIdSelectionByCommunityId,
		sessionPersonas,
	}: Ui,
	dispatch: Dispatch,
	params: {community?: string; space?: string},
	query: URLSearchParams,
): void => {
	if (!params.community) return;

	const $communities = get(communities);
	const $personaIndexSelection = get(personaIndexSelection);
	const $communityIdSelection = get(communityIdSelection);
	const $spacesByCommunityId = get(spacesByCommunityId);
	const $spaceIdSelectionByCommunityId = get(spaceIdSelectionByCommunityId);
	const $sessionPersonas = get(sessionPersonas);

	const rawPersonaIndex = query.get(PERSONA_QUERY_KEY);
	const personaIndex = rawPersonaIndex === null ? null : Number(rawPersonaIndex);
	const persona: Readable<Persona> | null =
		personaIndex === null ? null : $sessionPersonas[personaIndex];
	if (!persona) {
		if (browser) {
			const fallbackPersonaIndex = 0;
			log.warn(
				`unable to find persona at index ${personaIndex}; falling back to index ${fallbackPersonaIndex}`,
			);
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			goto(
				location.pathname +
					'?' +
					setUrlPersona(fallbackPersonaIndex, new URLSearchParams(location.search)),
				{replaceState: true},
			);
			return; // exit early; this function re-runs from the `goto` call with the updated `$page`
		}
	} else if (personaIndex !== $personaIndexSelection) {
		dispatch.SelectPersona({persona_id: get(persona).persona_id});
	} // else already selected

	// TODO speed this up with a map of communityByName
	const communityStore = $communities.value.find((c) => get(c).name === params.community);
	if (!communityStore) return; // occurs when a session routes to a community they can't access
	const community = get(communityStore);
	const {community_id} = community;
	if (community_id !== $communityIdSelection) {
		dispatch.SelectCommunity({community_id});
	}
	if (community_id) {
		const spaceUrl = '/' + (params.space || '');
		//TODO lookup space by community_id+url (see this comment in multiple places)
		const space = $spacesByCommunityId.get(community_id)!.find((s) => get(s).url === spaceUrl);
		if (!space) throw Error(`TODO Unable to find space: ${spaceUrl}`);
		const {space_id} = get(space);
		if (space_id !== $spaceIdSelectionByCommunityId[community_id]) {
			dispatch.SelectSpace({community_id, space_id});
		}
	} else {
		// TODO what is this condition?
	}
};
