import type {Root, SvelteChild, Node} from 'svast';
import {compile as stringifySvast} from 'svast-stringify';
import {parse as parseSvast} from 'svelte-parse';
import {setContext, getContext} from 'svelte';
import {type Readable} from 'svelte/store';
import {type Result} from '@feltcoop/felt';

import {type Space} from '$lib/vocab/space/space';
import {type Community} from '$lib/vocab/community/community';
import {type Persona} from '$lib/vocab/persona/persona';

export type ViewData = Root;

export type ViewNode = Root | SvelteChild; // TODO does this technically need to include `Node`?

// TODO add `icon` to `viewTemplates` and move `spaceTypeIcons` from `SpaceIcon.svelte` to here

/**
 * The views available for users to create in a community, in order of appearance.
 */
export const viewTemplates: Array<{name: string; template: string}> = [
	{name: 'Room', template: '<Room />'},
	{name: 'Board', template: '<Board />'},
	{name: 'Forum', template: '<Forum />'},
	{name: 'Notes', template: '<Notes />'},
	{name: 'Voice', template: '<Voice />'},
	{name: 'Iframe', template: '<Iframe />'},
	{name: 'EntityExplorer', template: '<EntityExplorer />'},
	{name: 'Todo', template: '<Todo />'},
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

// TODO delete this after adding icon to view templates (see also the above TODO)
// Returns the first Svelte component's tag name.
export const toViewType = (view: ViewNode | Node): string | undefined => {
	if (view.type === 'svelteComponent' && 'tagName' in view) return view.tagName;
	if ('children' in view) {
		for (const child of view.children) {
			const type = toViewType(child);
			if (type) return type;
		}
	}
	return undefined;
};

export const toComponentViewData = (tagName: string): ViewData => ({
	type: 'root',
	children: [
		{
			type: 'svelteComponent',
			tagName,
			properties: [],
			selfClosing: true,
			children: [],
		} as any, // TODO this cast is needed until this PR fixes it: https://github.com/pngwn/MDsveX/pull/436
	],
});

export interface ViewContext {
	persona: Readable<Persona>;
	community: Readable<Community>;
	space: Readable<Space>;
}

const KEY = Symbol();
export const getViewContext = (): Readable<ViewContext> => getContext(KEY);
export const setViewContext = (ctx: Readable<ViewContext>): void => setContext(KEY, ctx);

export const parseView = (value: string, generatePositions = false): ViewData =>
	parseSvast({value, generatePositions});

export const parseViewString = (value: string): Result<{value: string}, {message: string}> => {
	try {
		const parsed = parseView(value);
		return {ok: true, value: stringifySvast(parsed)};
	} catch (err) {
		return {ok: false, message: 'failed to parse'};
	}
};

export const serializeView = stringifySvast;
