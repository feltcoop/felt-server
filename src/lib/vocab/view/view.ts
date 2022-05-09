import type {Root, SvelteChild} from 'svast';
import {compile as stringifySvast} from 'svast-stringify';
import {setContext, getContext} from 'svelte';
import type {Readable} from 'svelte/store';

import type {Space} from '$lib/vocab/space/space';
import type {Community} from '$lib/vocab/community/community';
import type {Persona} from '$lib/vocab/persona/persona';
import {parseSvast} from '$lib/util/parseSvast';

export type ViewData = Root;

export type ViewNode = Root | SvelteChild; // TODO does this technically need to include `Node`?

// TODO add `icon` to `viewTemplates` and move `spaceTypeIcons` from `SpaceIcon.svelte` to here

/**
 * The views available for users to create in a community, in order of appearance.
 */
export const viewTemplates: Array<{
	name: string;
	view: string;
	icon: string;
	creatable?: boolean;
}> = [
	{name: 'Home', view: '<Home />', icon: '🏠', creatable: false}, // TODO better name?
	{name: 'Room', view: '<Room />', icon: '🗨'},
	{name: 'Board', view: '<Board />', icon: '📚'},
	{name: 'Forum', view: '<Forum />', icon: '📋'},
	{name: 'Notes', view: '<Notes />', icon: '🏷'},
	{name: 'Iframe', view: '<Iframe />', icon: '💻'}, // TODO does this need a default `src`?
	{name: 'EntityExplorer', view: '<EntityExplorer />', icon: '✏️'},
	{name: 'Todo', view: '<Todo />', icon: '🗒'},
];

/**
 * Returns the props object for a Svelte component SVAST,
 * e.g. `<Foo a="A" b="B" />` returns `{a: 'A', b: 'B'}`.
 * @param view
 * @returns Props object that can be splatted into a Svelte component.
 */
export const toViewProps = (view: ViewNode): Record<string, any> | undefined => {
	let props: Record<string, any> | undefined;
	if ('properties' in view) {
		for (const prop of view.properties) {
			const v = prop.value[0];
			if (v?.type === 'text') {
				(props || (props = {}))[prop.name] = v.value;
			}
		}
	}
	return props;
};

export interface ViewContext {
	persona: Readable<Persona>;
	community: Readable<Community>;
	space: Readable<Space>;
}

const KEY = Symbol();
export const getViewContext = (): Readable<ViewContext> => getContext(KEY);
export const setViewContext = (ctx: Readable<ViewContext>): Readable<ViewContext> =>
	setContext(KEY, ctx);

export const parseView = (value: string, generatePositions = false): ViewData =>
	parseSvast({value, generatePositions});

export const serializeView = stringifySvast;
