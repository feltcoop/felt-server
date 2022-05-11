import {goto} from '$app/navigation';
import {get} from 'svelte/store';
import {page} from '$app/stores';

import type {Mutations} from '$lib/app/eventTypes';
import {addPersona} from '$lib/vocab/persona/personaMutationHelpers';
import {addCommunity} from '$lib/vocab/community/communityMutationHelpers';
import {toSpaceUrl} from '$lib/ui/url';

export const CreateCommunity: Mutations['CreateCommunity'] = async ({params, invoke, ui}) => {
	const {sessionPersonaIndices, personaById} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const {
		community: $community,
		spaces: $spaces,
		memberships: $memberships,
		communityPersona: $persona,
	} = result.value;
	addPersona(ui, $persona);
	addCommunity(ui, $community, $spaces, $memberships);
	await goto(
		toSpaceUrl($community, null, get(page).url.searchParams, {
			persona: get(sessionPersonaIndices).get(personaById.get(params.persona_id)!) + '',
		}),
	);
	return result;
};

export const UpdateCommunitySettings: Mutations['UpdateCommunitySettings'] = async ({
	params,
	invoke,
	ui: {communityById},
}) => {
	// optimistic update
	const community = communityById.get(params.community_id)!;
	const originalSettings = get(community).settings;
	community.update(($community) => ({
		...$community,
		settings: {...$community.settings, ...params.settings},
	}));
	const result = await invoke();
	if (!result.ok) {
		community.update(($community) => ({...$community, settings: originalSettings}));
	}
	return result;
};

export const DeleteCommunity: Mutations['UpdateCommunitySettings'] = async ({
	params,
	invoke,
	ui: {
		communityById,
		communitySelection,
		personaSelection,
		communities,
		communityIdSelectionByPersonaId,
		personaById,
	},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {community_id} = params;
	const community = communityById.get(community_id)!;

	if (get(communitySelection) === community) {
		const persona = get(personaSelection)!;
		await goto('/' + get(persona).name + location.search, {replaceState: true});
	}

	communityById.delete(community_id);
	communities.mutate(($communites) => $communites.splice($communites.indexOf(community), 1)); // TODO use fast volatile remove instead, or maybe a set?
	communityIdSelectionByPersonaId.mutate(($c) => {
		for (const [persona_id, communityIdSelection] of $c) {
			if (communityIdSelection === community_id) {
				$c.set(persona_id, get(personaById.get(persona_id)!).community_id);
			}
		}
	});

	return result;
};
