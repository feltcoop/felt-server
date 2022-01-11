// TODO the npm package `svast` will be the data structure for `ViewData`:
// https://github.com/pngwn/MDsveX/tree/master/packages/svast

export enum ViewType {
	Home = 'Home',
	Room = 'Room',
	Board = 'Board',
	Forum = 'Forum',
	Notes = 'Notes',
	Voice = 'Voice',
	Iframe = 'Iframe',
}
export const viewTypes: ViewType[] = Object.keys(ViewType) as ViewType[];

export interface ViewData {
	type: ViewType;
	props: ViewProps;
}
export type ViewProps = any; // TODO generic per type?
