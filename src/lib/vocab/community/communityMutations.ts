import {goto} from '$app/navigation';
import {get} from 'svelte/store';

import type {Mutations} from '$lib/app/eventTypes';
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

export const DeleteCommunity: Mutations['UpdateCommunitySettings'] = async ({
	params,
	invoke,
	ui: {
		communityById,
		communitySelection,
		personaSelection,
		communities,
		communityIdSelectionByPersonaId,
	},
}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {community_id} = params;
	const community = communityById.get(community_id)!;
	communityById.delete(community_id);
	communities.mutate(($communites) => $communites.splice($communites.indexOf(community), 1)); // TODO use fast volatile remove instead, or maybe a set?

	// TODO BLOCK make this a map instead of an object because the persona ids are coerced to strings!
	// TODO BLOCK fix stale communityIdSelectionByPersonaId
	// TODO what's the cleaner way to do this? just use `update` and always cause a store change?
	// doesn't that then cause derived stores to wastefully recalc?
	const $communityIdSelectionByPersonaId = get(communityIdSelectionByPersonaId);
	let shouldUpdateCommunityIdSelectionByPersonaId = false;
	for (const key in $communityIdSelectionByPersonaId) {
		if ($communityIdSelectionByPersonaId[key] === community_id) {
			shouldUpdateCommunityIdSelectionByPersonaId = true;
			break;
		}
	}
	communityIdSelectionByPersonaId.update(($v) => {});
	const selectedCommunity = get(communitySelection);

	if (selectedCommunity === community) {
		const persona = get(personaSelection)!;
		await goto('/' + get(persona).name + location.search, {replaceState: true});
	}
	return result;
};
