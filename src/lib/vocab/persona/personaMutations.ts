import {get} from 'svelte/store';
import {goto} from '$app/navigation';

import type {Mutations} from '$lib/app/eventTypes';
import {addPersona} from '$lib/vocab/persona/personaMutationHelpers';
import {addCommunity} from '$lib/vocab/community/communityMutationHelpers';
import {toUrl} from '$lib/ui/url';

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
	await goto(toUrl('/' + $community.name, {persona: get(sessionPersonaIndices).get(persona)}));
	return result;
};
