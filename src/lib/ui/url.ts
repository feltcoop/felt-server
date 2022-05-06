import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';

export const PERSONA_QUERY_KEY = 'persona';

export const toUrl = (
	pathname: string,
	params?: URLSearchParams, // TODO BLOCK clone?
): string => {
	// TODO BLOCK use a cached version?
	return `${pathname}?${setUrlPersona(personaIndex, params)}`;
};

export const toSpaceUrl = (
	personaIndex: number | null,
	community: Community,
	space: Space | null,
	params?: URLSearchParams, // TODO BLOCK clone?
): string => {
	const url = space?.url;
	return `/${community.name}${!url || isHomeSpace(space) ? '' : url}?${setUrlPersona(
		personaIndex,
		params,
	)}`;
};

export const setUrlPersona = (
	personaIndex: null | number,
	params = new URLSearchParams(),
): URLSearchParams => {
	if (personaIndex !== null) {
		params.set(PERSONA_QUERY_KEY, personaIndex.toString());
	}
	return params;
};
