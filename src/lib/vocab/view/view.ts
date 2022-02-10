// TODO the npm package `svast` will be the data structure for `ViewData`:
// https://github.com/pngwn/MDsveX/tree/master/packages/svast
export interface ViewData {
	type: string;
	props?: ViewProps;
}
export type ViewProps = any; // TODO generic per type?

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
