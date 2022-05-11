import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';

export const PERSONA_QUERY_KEY = 'persona';

export type SearchParams<TKey extends string = string> = Record<TKey, string | null | undefined>;

export const toUrl = (
	pathname: string,
	baseParams: URLSearchParams,
	newSearchParams?: SearchParams<typeof PERSONA_QUERY_KEY>,
): string =>
	`${pathname}?${newSearchParams ? setSearchParams(baseParams, newSearchParams) : baseParams}`;

export const toSpaceUrl = (
	community: Community,
	space: Space | null | undefined,
	baseParams: URLSearchParams,
	newSearchParams?: SearchParams<typeof PERSONA_QUERY_KEY>,
): string => {
	let pathname = '/' + community.name;
	const spaceUrl = space?.url;
	if (spaceUrl && !isHomeSpace(space)) pathname += spaceUrl;
	return toUrl(pathname, baseParams, newSearchParams);
};

const setSearchParams = (
	baseParams: URLSearchParams,
	newSearchParams: SearchParams,
): URLSearchParams => {
	let finalParams: URLSearchParams | undefined;
	for (const key in newSearchParams) {
		const value = newSearchParams[key];
		if (value == null) {
			if (baseParams.has(key)) {
				if (!finalParams) finalParams = new URLSearchParams(baseParams);
				finalParams.delete(key);
			}
		} else if (value !== baseParams.get(key)) {
			if (!finalParams) finalParams = new URLSearchParams(baseParams);
			finalParams.set(key, value);
		}
	}
	return finalParams || baseParams;
};
