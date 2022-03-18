import {writable, type Writable} from 'svelte/store';

import type {WritableUi} from '$lib/ui/ui';
import type {Persona} from '$lib/vocab/persona/persona';

export const addPersona = (
	{personaById, personas, sessionPersonas}: WritableUi,
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
