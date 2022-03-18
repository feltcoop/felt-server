import {writable, type Writable} from 'svelte/store';

import type {Ui} from '$lib/ui/ui';
import type {Persona} from '$lib/vocab/persona/persona';

// TODO BLOCK `communityMutationHelpers.ts` or `community.mutations.ts` or something else?

export const addPersona = (
	{personaById, personas, sessionPersonas}: Ui,
	$persona: Persona,
): Writable<Persona> => {
	const persona = writable($persona);
	personaById.set($persona.persona_id, persona);
	personas.mutate(($personas) => $personas.push(persona));
	if ($persona.account_id) {
		sessionPersonas.update(($sessionPersonas) => $sessionPersonas.concat(persona));
	}
	return persona;
};
