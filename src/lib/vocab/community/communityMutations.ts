import {goto} from '$app/navigation';

import type {Mutations} from '$lib/app/eventTypes';
import {addPersona} from '$lib/vocab/persona/personaMutationHelpers';
import {addCommunity} from '$lib/vocab/community/communityMutationHelpers';

export const CreateCommunity: Mutations['CreateCommunity'] = async ({invoke, ui}) => {
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
	return result;
};

export const UpdateCommunitySettings: Mutations['UpdateCommunitySettings'] = async ({
	params,
	invoke,
	ui: {communityById},
}) => {
	// optimistic update
	const community = communityById.get(params.community_id)!;
	const originalSettings = community.get().settings;
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

	if (communitySelection.get() === community) {
		const persona = personaSelection.get()!;
		await goto('/' + persona.get().name + location.search, {replaceState: true});
	}

	communityById.delete(community_id);
	communities.mutate(($communites) => $communites.splice($communites.indexOf(community), 1)); // TODO use fast volatile remove instead, or maybe a set?
	communityIdSelectionByPersonaId.mutate(($c) => {
		for (const [persona_id, communityIdSelection] of $c) {
			if (communityIdSelection === community_id) {
				$c.set(persona_id, personaById.get(persona_id)!.get().community_id);
			}
		}
	});

	return result;
};
