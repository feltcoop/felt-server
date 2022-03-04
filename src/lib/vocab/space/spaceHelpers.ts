import {type ViewData} from '$lib/vocab/view/view';

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
