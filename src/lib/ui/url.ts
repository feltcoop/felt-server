// TODO not sure about this -- maybe these belong in another module, like ./persona.ts
// but  at the moment that imports `ajv`, and we need to worry about treeshaking it out
// (might be fine, but needs investigation before adding,
// because we don't want clients to import `ajv` unless needed)

import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';

export const PERSONA_QUERY_KEY = 'persona';

// TODO should this api extend the existing `URLSearchParams`? (to preserve?)
// TODO do this more robustly with the existing url
export const toSpaceUrl = (
	personaIndex: number | null,
	community: Community,
	space: Space | null,
	params?: URLSearchParams,
): string => {
	const url = space && space.url; // TODO could be `space.url` but that messes the types up for some reason, adds undefined and removes null
	return `/${community.name}${!url || url === '/' ? '' : url}?${setUrlPersona(
		personaIndex,
		params,
	)}`;
};

export const setUrlPersona = (personaIndex: null | number, params = new URLSearchParams()) => {
	if (personaIndex !== null && personaIndex !== -1) {
		params.set(PERSONA_QUERY_KEY, personaIndex.toString());
	}
	return params;
};
