import {writable} from 'svelte/store';
import type {Readable, StartStopNotifier} from 'svelte/store';

// TODO tweak offsets -- currently the primary action is immediately hovered
// where should these constants live?
export const CONTEXT_MENU_OFFSET_X = -2;
export const CONTEXT_MENU_OFFSET_Y = -2;

export interface Contextmenu {
	opened: boolean;
	// TODO not sure about this, currently they're magic keys, maybe keys on `ui`?
	// so could they be addressed by `name || id`? e.g. `'selectedPersona'`
	// maybe they should be blocks and block ids? or both?
	entities: string[];
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

// TODO also search for `a` in this function
export const queryContextmenuEntityIds = (target: HTMLElement | SVGElement): string[] => {
	const ids: string[] = [];
	let el: HTMLElement | SVGElement | null = target;
	while ((el = el && el.closest('[data-entity]'))) {
		// TODO speed this up? count is low so `includes` seems better than a set
		for (const id of el.dataset.entity!.split(',')) {
			if (!ids.includes(id)) {
				ids.push(id);
			}
		}
		el = el.parentElement;
	}
	return ids;
};

export const onContextmenu = (contextmenu: ContextmenuStore) => (e: MouseEvent) => {
	if (e.ctrlKey) return; // defer control!
	const entities = queryContextmenuEntityIds(e.target as any);
	if (!entities.length) return;
	e.stopPropagation();
	e.preventDefault();
	contextmenu.open(entities, e.clientX + CONTEXT_MENU_OFFSET_X, e.clientY + CONTEXT_MENU_OFFSET_Y);
};
