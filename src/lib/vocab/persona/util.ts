// TODO not sure about this -- maybe these belong in another module, like ./persona.ts
// but  at the moment that imports `ajv`, and we need to worry about treeshaking it out
// (might be fine, but needs investigation before adding,
// because we don't want clients to import `ajv` unless needed)

import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';

export const GUEST_PERSONA_NAME = 'guest';

// TODO should this api extend the existing `URLSearchParams`? (to preserve?)
// TODO do this more robustly with the existing url
export const toSpaceUrl = (
	personaIndex: number | null,
	community: Community,
	space: Space | null,
): string => {
	const url = space && space.url; // TODO could be `space.url` but that messes the types up for some reason, adds undefined and removes null
	const params: Record<string, string> = {};
	if (personaIndex !== null && personaIndex !== -1) {
		params.persona = personaIndex.toString();
	}
	return `/${community.name}${!url || url === '/' ? '' : url}?${new URLSearchParams(params)}`;
};
