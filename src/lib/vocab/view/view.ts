import type {Root, SvelteParent, SvelteChild, Node} from 'svast';

export type ViewData = Root | SvelteParent | SvelteChild | Node<any>;

/**
 * The views available for users to create in a community, in order of appearance.
 */
export const viewTemplates: Array<{type: string; view: string}> = [
	{type: 'Room', view: '<Room />'}, // TODO add icon
	{type: 'Board', view: '<Board />'},
	{type: 'Forum', view: '<Forum />'},
	{type: 'Notes', view: '<Notes />'},
	{type: 'Voice', view: '<Voice />'},
	{type: 'Iframe', view: '<Iframe />'},
	{type: 'EntityExplorer', view: '<EntityExplorer />'},
	{type: 'Todo', view: '<Todo />'},
];

/**
 * Returns the props object for a Svelte component SVAST,
 * e.g. `<Foo a="A" b="B" />` returns `{a: 'A', b: 'B'}`.
 * @param view
 * @returns Props object that can be splatted into a Svelte component.
 */
export const toViewProps = (view: ViewData): Record<string, any> | undefined => {
	let props: Record<string, any> | undefined;
	if ('properties' in view) {
		for (const prop of view.properties) {
			const v = prop.value[0];
			// TODO for e.g. number literals, handle `v.type === 'svelteDynamicContent'` ?
			if (v?.type === 'text') {
				(props || (props = {}))[prop.name] = v.value;
			}
		}
	}
	return props;
};

// TODO BLOCK -- icon would be set at creation

// Returns the first Svelte component's tag name.
export const toViewType = (view: ViewData): string | undefined => {
	if (view.type === 'svelteComponent' && 'tagName' in view) return view.tagName;
	if ('children' in view) {
		for (const child of view.children) {
			const type = toViewType(child);
			if (type) return type;
		}
	}
	return undefined;
};
