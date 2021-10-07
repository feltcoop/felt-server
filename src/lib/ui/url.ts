import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';

export const PERSONA_QUERY_KEY = 'persona';

export const toSpaceUrl = (
	personaIndex: number | null,
	community: Community,
	space: Space | null,
	params?: URLSearchParams,
): string => {
	const url = space?.url;
	return `/${community.name}${!url || url === '/' ? '' : url}?${setUrlPersona(
		personaIndex,
		params,
	)}`;
};

export const setUrlPersona = (personaIndex: null | number, params = new URLSearchParams()) => {
	if (personaIndex !== null) {
		params.set(PERSONA_QUERY_KEY, personaIndex.toString());
	}
	return params;
};
