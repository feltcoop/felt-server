import {page} from '$app/stores';
import type {Page} from '@sveltejs/kit';

import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';

export const PERSONA_QUERY_KEY = 'persona';

let $page: Page;
// TODO ? what if every time if changed, we flushed the cache, and reuse `searchParams`
page.subscribe(($p) => ($page = $p));

export const toUrl = (
	pathname: string,
	newSearchParams?: Record<string, string>, // TODO BLOCK clone?
	baseParams = $page.url.searchParams,
): string => {
	// TODO BLOCK use a cached version?
	return `${pathname}?${setUrlPersona(personaIndex, newSearchParams, baseParams)}`;
};

export const toSpaceUrl = (
	personaIndex: number | null, // TODO BLOCK should be a no-op if already selected
	community: Community,
	space: Space | null,
	newSearchParams?: Record<string, string>, // TODO BLOCK clone?
	baseParams = $page.url.searchParams,
): string => {
	const url = space?.url;
	return toUrl(
		`/${community.name}${!url || isHomeSpace(space) ? '' : url}`,
		setUrlPersona(personaIndex, params),
	);
};

export const setUrlPersona = (
	personaIndex: null | number,
	newSearchParams?: Record<string, string>, // TODO BLOCK clone?
	baseParams = $page.url.searchParams,
	baseParams = new URLSearchParams(),
): URLSearchParams => {
	if (personaIndex !== null) {
		params.set(PERSONA_QUERY_KEY, personaIndex.toString());
	}
	return params;
};
