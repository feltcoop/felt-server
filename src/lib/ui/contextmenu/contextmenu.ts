import {writable, type Readable, type StartStopNotifier} from 'svelte/store';
import {isEditable} from '@feltcoop/felt/util/dom.js';
import {last} from '@feltcoop/felt/util/array.js';
import {getContext, onDestroy, setContext} from 'svelte';

const CONTEXTMENU_STATE_KEY = Symbol();

interface ContextmenuItems {
	[key: string]: any; // TODO types
}

type ItemState = SubmenuState | EntryState;
interface EntryState {
	// TODO action callback or event?
	isMenu: false;
	menu: SubmenuState | RootMenuState;
	selected: boolean;
}
interface SubmenuState {
	isMenu: true;
	menu: SubmenuState | RootMenuState;
	selected: boolean;
	items: ItemState[];
}
interface RootMenuState {
	isMenu: true;
	menu: null;
	items: ItemState[];
}

export interface Contextmenu {
	open: boolean;
	items: ContextmenuItems;
	selections: ItemState[]; // mutated internally; components must not expect immutability!
	menu: RootMenuState; // mutated internally; components must not expect immutability!
	x: number;
	y: number;
}

export interface ContextmenuStore extends Readable<Contextmenu> {
	open(items: ContextmenuItems, x: number, y: number): void;
	close(): void;
	selectItem(item: ItemState): void;
	collapseSelected(): void; // removes one
	expandSelected(): void; // opens the selected submenu
	selectNext(): void; // advances to the next of the latest
	selectPrevious(): void; // removes one
	action: typeof contextmenuAction;
	addEntry(): EntryState;
	addSubmenu(): SubmenuState;
}

const logSelections = (selections: ItemState[]) => {
	console.log('selections:');
	selections.forEach((s, i) => console.log(i, s));
};

export const createContextmenuStore = (
	initialValue: Contextmenu = {
		open: false,
		items: {},
		selections: [],
		menu: {isMenu: true, menu: null, items: []},
		x: 0,
		y: 0,
	},
	start?: StartStopNotifier<Contextmenu>,
): ContextmenuStore => {
	const rootMenu = initialValue.menu;

	const store = writable(initialValue, start);
	const {subscribe, update} = store;

	return {
		subscribe,
		open: (items, x, y) => {
			update(($state) => {
				$state.selections.length = 0;
				return {...$state, open: true, items, x, y};
			});
		},
		close: () => {
			update(($state) => ({...$state, open: false}));
		},
		selectItem: (item) => {
			update(($state) => {
				const {selections} = $state;
				if (last(selections) === item) return $state;
				// Instead of diffing, this does the simple thing and
				// deselects everything and then re-creates the list of selections.
				// Could be improved but it's fine because we're using mutation.
				for (const selection of selections) {
					selection.selected = false;
				}
				selections.length = 0;
				let i: ItemState | RootMenuState = item;
				do {
					i.selected = true;
					selections.unshift(i);
				} while ((i = i.menu) && i.menu);
				logSelections(selections);
				return {...$state};
			});
		},
		collapseSelected: () => {
			update(($state) => {
				const {selections} = $state;
				if (selections.length <= 1) return $state;
				const deselected = selections.pop()!;
				deselected.selected = false;
				return {...$state};
			});
		},
		expandSelected: () => {
			update(($state) => {
				const {selections} = $state;
				const parent = last(selections);
				if (!parent?.isMenu) return $state;
				const selected = parent.items[0];
				selected.selected = true;
				selections.push(selected);
				return {...$state};
			});
		},
		selectNext: () => {
			update(($state) => {
				cycleSelections($state, true);
				return {...$state};
			});
		},
		selectPrevious: () => {
			update(($state) => {
				cycleSelections($state, false);
				return {...$state};
			});
		},
		action: contextmenuAction,
		addEntry: () => {
			const menu = (getContext(CONTEXTMENU_STATE_KEY) as SubmenuState | undefined) || rootMenu;
			const entry: EntryState = {isMenu: false, menu, selected: false};
			console.log('addEntry', menu, entry);
			menu.items.push(entry);
			onDestroy(() => {
				menu.items.length = 0;
			});
			return entry;
		},
		addSubmenu: () => {
			const menu = (getContext(CONTEXTMENU_STATE_KEY) as SubmenuState | undefined) || rootMenu;
			const submenu: SubmenuState = {isMenu: true, menu, selected: false, items: []};
			menu.items.push(submenu);
			setContext(CONTEXTMENU_STATE_KEY, submenu);
			console.log('addSubmenu', menu, submenu);
			onDestroy(() => {
				menu.items.length = 0;
			});
			return submenu;
		},
	};
};

const cycleSelections = ($state: Contextmenu, forward: boolean): void => {
	const {selections} = $state;
	const deselected = last(selections) as ItemState | undefined;
	let nextItem: ItemState;
	if (deselected) {
		deselected.selected = false;
		const items = deselected.menu.items;
		const i = items.indexOf(deselected);
		nextItem =
			items[forward ? (i === items.length - 1 ? 0 : i + 1) : i === 0 ? items.length - 1 : i - 1];
	} else {
		nextItem = $state.menu.items[forward ? 0 : $state.menu.items.length - 1];
	}
	nextItem.selected = true;
	selections.pop();
	selections.push(nextItem);
	logSelections(selections);
};

// The dataset key must not have capital letters or dashes or it'll differ between JS and DOM:
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
const CONTEXTMENU_DATASET_KEY = 'contextmenu';
const CONTEXTMENU_DOM_QUERY = `[data-${CONTEXTMENU_DATASET_KEY}],a`;
// TODO consider a `WeakMap` instead; doesn't seem to improve things much
const contextmenuCache = new Map<string, any>();
let cacheKeyCounter = 0;

const contextmenuAction = (el: HTMLElement | SVGElement, params: any): any => {
	const key = cacheKeyCounter++ + '';
	el.dataset[CONTEXTMENU_DATASET_KEY] = key;
	contextmenuCache.set(key, params);
	return {
		update: (p: any) => {
			contextmenuCache.set(key, p);
		},
		destroy: () => {
			contextmenuCache.delete(key);
		},
	};
};

/**
 * Creates an event handler callback that opens the contextmenu, if appropriate,
 * querying the menu items from the DOM starting at the event target.
 * @param contextmenu
 * @returns An event handler that opens the contextmenu, unless the target is inside `excludeEl`.
 */
export const onContextmenu =
	(contextmenu: ContextmenuStore) =>
	(e: MouseEvent, excludeEl?: HTMLElement): void | false => {
		if (e.shiftKey) return;
		const target = e.target as HTMLElement;
		if (isEditable(target) || excludeEl?.contains(target)) return;
		const items = queryContextmenuItems(target);
		if (!items) return;
		e.stopPropagation();
		e.preventDefault();
		// TODO dispatch a UI event, like OpenContextmenu
		contextmenu.open(items, e.clientX, e.clientY);
		return false; // TODO remove this if it doesn't fix FF mobile (and update the `false` return value)
	};

const queryContextmenuItems = (target: HTMLElement | SVGElement): null | ContextmenuItems => {
	let items: null | ContextmenuItems = null;
	let el: HTMLElement | SVGElement | null = target;
	let cacheKey: any, cached: any, c: any;
	while ((el = el && el.closest(CONTEXTMENU_DOM_QUERY))) {
		if ((cacheKey = el.dataset[CONTEXTMENU_DATASET_KEY])) {
			if (!items) items = {};
			cached = contextmenuCache.get(cacheKey);
			for (const key in cached) {
				// preserve bubbling order and ignore `undefined` values
				if (!(key in items)) {
					c = cached[key];
					if (c !== undefined) items[key] = c;
				}
			}
		}
		if (el.tagName === 'A') {
			if (!items) items = {};
			items.LinkContextmenu = {href: (el as HTMLAnchorElement).href};
		}
		el = el.parentElement;
	}
	return items;
};
