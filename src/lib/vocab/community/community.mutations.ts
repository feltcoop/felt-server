import type {Mutations} from '$lib/app/mutationTypes';

export const CreateCommunity: Mutations['CreateCommunity'] = async ({params, invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {persona_id} = params;
	const {
		community: $community,
		spaces: $spaces,
		memberships: $memberships,
		communityPersona: $persona,
	} = result.value;
	log.trace('[ui.CreateCommunity]', $community, persona_id);
	addPersona($persona);
	addCommunity($community, $spaces, $memberships);
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
