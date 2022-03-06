import type {Root, SvelteParent, SvelteChild, Node} from 'svast';

// TODO BLOCK what should this type be? `Root` only maybe? (bc `compile`)
export type ViewData = Root | SvelteParent | SvelteChild | Node<any>;

/**
 * The views available for users to create in a community, in order of appearance.
 */
export const availableViewTypes: string[] = [
	'Room',
	'Board',
	'Forum',
	'Notes',
	'Voice',
	'Iframe',
	'EntityExplorer',
	'Todo',
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

// TODO BLOCK is this the desired design? it's just a heuristic for guessing the view type,
// but we no longer have a "view type" in the same way,
// views are now the SVAST data (can be plain text!) including zero or more components

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
