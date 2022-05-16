import type {Readable} from '@feltcoop/svelte-gettable-stores';
import {browser} from '$app/env';
import {goto} from '$app/navigation';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Persona} from '$lib/vocab/persona/persona';
import {PERSONA_QUERY_KEY, toUrl} from '$lib/ui/url';
import type {Dispatch} from '$lib/app/eventTypes';
import type {Ui} from '$lib/ui/ui';

const log = new Logger('[syncUiToUrl]');

// TODO instead of dispatching `select` events on startup, initialize with correct values

export const syncUiToUrl = (
	{
		communities,
		personaIndexSelection,
		communitySelection,
		spacesByCommunityId,
		spaceIdSelectionByCommunityId,
		sessionPersonas,
	}: Ui,
	dispatch: Dispatch,
	params: {community?: string; space?: string},
	url: URL,
): void => {
	if (!params.community) return;

	const rawPersonaIndex = url.searchParams.get(PERSONA_QUERY_KEY);
	const personaIndex = rawPersonaIndex ? Number(rawPersonaIndex) : null;
	const persona: Readable<Persona> | null =
		personaIndex === null ? null : sessionPersonas.get()[personaIndex];
	if (!persona) {
		if (browser) {
			const fallbackPersonaIndex = 0;
			log.warn(
				`failed to find persona at index ${personaIndex}; falling back to index ${fallbackPersonaIndex}`,
			);
			void goto(toUrl(url.pathname, url.searchParams, {persona: fallbackPersonaIndex + ''}), {
				replaceState: true,
			});
			return; // exit early; this function re-runs from the `goto` call with the updated `$page`
		}
	} else if (personaIndex !== personaIndexSelection.get()) {
		dispatch.SelectPersona({persona_id: persona.get().persona_id});
	} // else already selected

	// TODO speed this up with a map of communityByName
	const community = communities.get().value.find((c) => c.get().name === params.community);
	if (!community) {
		// occurs when routing to an inaccessible or nonexistent community
		dispatch.SelectCommunity({community_id: null});
		return;
	}
	const {community_id} = community.get();
	if (community !== communitySelection.get()) {
		dispatch.SelectCommunity({community_id});
	}

	const spaceUrl = '/' + (params.space || '');
	//TODO lookup space by community_id+url (see this comment in multiple places)
	const space = spacesByCommunityId
		.get()
		.get(community_id)!
		.find((s) => s.get().url === spaceUrl);
	if (!space) {
		// occurs when routing to an inaccessible or nonexistent space
		dispatch.SelectSpace({community_id, space_id: null});
		return;
	}
	const selectedSpaceId = spaceIdSelectionByCommunityId.get().value.get(community_id);
	const {space_id} = space.get();
	if (space_id !== selectedSpaceId) {
		dispatch.SelectSpace({community_id, space_id});
	}
};
