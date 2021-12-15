import {writable} from 'svelte/store';
import type {Readable, StartStopNotifier} from 'svelte/store';

// TODO tweak offsets -- currently the primary action is immediately hovered
// where should these constants live?
export const CONTEXT_MENU_OFFSET_X = -2;
export const CONTEXT_MENU_OFFSET_Y = -2;

export interface Contextmenu {
	opened: boolean;
	entities: string[]; // TODO not sure about this -- maybe should be blocks? or ids for blocks?
	x: number;
	y: number;
}

export interface ContextmenuStore extends Readable<Contextmenu> {
	open(entities: string[], x: number, y: number): void;
	close(): void;
}

export const createContextmenuStore = (
	initialValue: Contextmenu = {opened: false, entities: [], x: 0, y: 0},
	start?: StartStopNotifier<Contextmenu>,
): ContextmenuStore => {
	const {subscribe, update} = writable(initialValue, start);

	return {
		subscribe,
		open: (entities, x, y) => {
			update(($state) => ({...$state, opened: true, entities, x, y}));
		},
		close: () => {
			update(($state) => ({...$state, opened: false}));
		},
	};
};
