import {writable, type Readable, type StartStopNotifier} from 'svelte/store';
import {isEditable} from '@feltcoop/felt/util/dom.js';

interface ContextmenuItems {
	[key: string]: any; // TODO types
}

export interface Contextmenu {
	open: boolean;
	// TODO not sure about this, currently they're magic keys, maybe keys on `ui`?
	// so could they be addressed by `name || id`? e.g. `'personaSelection'`
	// maybe they should be blocks and block ids? or both?
	items: ContextmenuItems;
	x: number;
	y: number;
}

export interface ContextmenuStore extends Readable<Contextmenu> {
	open(items: ContextmenuItems, x: number, y: number): void;
	close(): void;
}

export const createContextmenuStore = (
	initialValue: Contextmenu = {open: false, items: {}, x: 0, y: 0},
	start?: StartStopNotifier<Contextmenu>,
): ContextmenuStore => {
	const {subscribe, update} = writable(initialValue, start);

	return {
		subscribe,
		open: (items, x, y) => {
			update(($state) => ({...$state, open: true, items, x, y}));
		},
		close: () => {
			update(($state) => ({...$state, open: false}));
		},
	};
};

export const queryContextmenuItems = (
	target: HTMLElement | SVGElement,
): null | ContextmenuItems => {
	let items: null | ContextmenuItems = null;
	let el: HTMLElement | SVGElement | null = target;
	let value: any;
	while ((el = el && el.closest('[data-contextmenu],a'))) {
		if ((value = el.dataset.contextmenu)) {
			if (!items) items = {};
			value = JSON.parse(value);
			for (const key in value) {
				if (!(key in items)) items[key] = value[key]; // preserve bubbling order
			}
		}
		if ('contextmenuStopPropagation' in el.dataset) break;
		if (el.tagName === 'A') {
			if (!items) items = {};
			items.LinkContextmenu = (el as HTMLAnchorElement).href;
		}
		el = el.parentElement;
	}
	return items;
};

export const onContextmenu = (contextmenu: ContextmenuStore) => (e: MouseEvent) => {
	if (e.ctrlKey) return; // defer control!
	const target = e.target as HTMLElement;
	if (isEditable(target)) return;
	const items = queryContextmenuItems(target);
	if (!items) return;
	e.stopPropagation();
	e.preventDefault();
	// TODO dispatch a UI event, like OpenContextmenu
	contextmenu.open(items, e.clientX, e.clientY);
};
