import {goto} from '$app/navigation';
import {page} from '$app/stores';
import {get} from 'svelte/store';

import type {Mutations} from '$lib/app/eventTypes';
import {addPersona} from '$lib/vocab/persona/personaMutationHelpers';
import {addCommunity} from '$lib/vocab/community/communityMutationHelpers';
import {toSpaceUrl} from '$lib/ui/url';

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
	await goto(
		toSpaceUrl($community, null, get(page).url.searchParams, {
			persona: sessionPersonaIndices.get().get(persona) + '',
		}),
	);
	return result;
};
