import type {Root, SvelteParent, SvelteChild} from 'svast';

export type ViewData = Root | SvelteParent | SvelteChild;

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
