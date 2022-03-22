import {get} from 'svelte/store';
import {goto} from '$app/navigation';

import type {Mutations} from '$lib/app/eventTypes';
import {addPersona} from '$lib/vocab/persona/personaMutationHelpers';
import {addCommunity} from '$lib/vocab/community/communityMutationHelpers';

export const CreateAccountPersona: Mutations['CreateAccountPersona'] = async ({invoke, ui}) => {
	const {sessionPersonaIndices} = ui;
	const result = await invoke();
	if (!result.ok) return result;
	const {
		persona: $persona,
		community: $community,
		spaces: $spaces,
		membership: $membership,
	} = result.value;
	const persona = addPersona(ui, $persona);
	addCommunity(ui, $community, $spaces, [$membership]);
	// TODO extract a helper after upgrading SvelteKit and using
	// `$page`'s `URLSearchParams` instead of constructing the search like this
	await goto('/' + $community.name + `?persona=${get(sessionPersonaIndices).get(persona)}`);
	return result;
};
