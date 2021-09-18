// TODO not sure about this -- maybe these belong in another module, like ./persona.ts
// but  at the moment that imports `ajv`, and we need to worry about treeshaking it out
// (might be fine, but needs investigation before adding,
// because we don't want clients to import `ajv` unless needed)

import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {Persona} from '$lib/vocab/persona/persona';

export const GUEST_PERSONA_NAME = 'guest';

// TODO should this api extend the existing `URLSearchParams`? (to preserve?)
// TODO do this more robustly with the existing url
export const toSpaceUrl = (persona: Persona, community: Community, space: Space | null): string =>
	`/${community.name}${toUrl(space && space.url)}?${toQueryParams(persona)}`;

// TODO this is a weird context, not sure how to name. maybe move to $lib/util if so
const toUrl = (url: string | null): string => (url === null || url === '/' ? '' : url);

// TODO extract? not sure how this API should look, not this tho
const toQueryParams = (persona: Persona): URLSearchParams =>
	new URLSearchParams({
		persona: persona.name,
	});
