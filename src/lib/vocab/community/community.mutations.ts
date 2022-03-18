import {goto} from '$app/navigation';
import {get} from 'svelte/store';

import type {Mutations} from '$lib/app/mutationTypes';
import {addPersona} from '$lib/vocab/persona/personaMutationHelpers';
import {addCommunity} from '$lib/vocab/community/communityMutationHelpers';

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
	// TODO extract a helper after upgrading SvelteKit and using
	// `$page`'s `URLSearchParams` instead of constructing the search like this
	await goto(
		'/' +
			$community.name +
			`?persona=${get(sessionPersonaIndices).get(personaById.get(params.persona_id)!)}`,
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
