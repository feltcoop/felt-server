import type {Mutations} from '$lib/app/mutationTypes';

export const CreateAccountPersona: Mutations['CreateAccountPersona'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	const {
		persona: $persona,
		community: $community,
		spaces: $spaces,
		membership: $membership,
	} = result.value;
	log.trace('[CreatePersona]', $persona, $community, $spaces);
	const persona = addPersona($persona);
	addCommunity($community, $spaces, [$membership]);
	// TODO extract a helper after upgrading SvelteKit and using
	// `$page`'s `URLSearchParams` instead of constructing the search like this
	await goto('/' + $community.name + `?persona=${get(sessionPersonaIndices).get(persona)}`);
	return result;
};
