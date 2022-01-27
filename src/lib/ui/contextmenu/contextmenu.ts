import {writable, type Readable} from 'svelte/store';
import {isEditable} from '@feltcoop/felt/util/dom.js';
import {last} from '@feltcoop/felt/util/array.js';
import {getContext, onDestroy, setContext} from 'svelte';

interface ContextmenuItems {
	[key: string]: any; // TODO types
}

export type ItemState = SubmenuState | EntryState;
export interface EntryState {
	isMenu: false;
	menu: SubmenuState | RootMenuState;
	selected: boolean;
	action: ContextmenuAction;
}
export interface SubmenuState {
	isMenu: true;
	menu: SubmenuState | RootMenuState;
	selected: boolean;
	items: ItemState[];
}
export interface RootMenuState {
	isMenu: true;
	menu: null;
	items: ItemState[];
}
export interface ContextmenuAction {
	(): void;
}

export interface Contextmenu {
	open: boolean;
	items: ContextmenuItems;
	x: number;
	y: number;
}

export interface ContextmenuStore extends Readable<Contextmenu> {
	open(items: ContextmenuItems, x: number, y: number): void;
	close(): void;
	activateSelected(): void; // removes one
	selectItem(item: ItemState): void;
	collapseSelected(): void; // removes one
	expandSelected(): void; // opens the selected submenu
	selectNext(): void; // advances to the next of the latest
	selectPrevious(): void; // removes one
	selectFirst(): void; // advances to the next of the latest
	selectLast(): void; // removes one
	action: typeof contextmenuAction;
	addEntry(action: ContextmenuAction): EntryState;
	addSubmenu(): SubmenuState;
	// These two properties are mutated internally.
	// If you need reactivity, use `$contextmenu` in a reactive statement to react to all changes, and
	// then access the mutable non-reactive  `contextmenu.rootMenu` and `contextmenu.selections`.
	// See `ContextmenuEntry.svelte` and `ContextmenuSubmenu.svelte` for reactive usage examples.
	rootMenu: RootMenuState;
	selections: ItemState[];
}

const CONTEXTMENU_STATE_KEY = Symbol();

/**
 * Creates a `contextmenu` store.
 * For external usage see `use:contextmenu.action` scattered throughout the app,
 * and for internal usage see `Contextmenu.svelte`.
 * @returns
 */
export const createContextmenuStore = (): ContextmenuStore => {
	const rootMenu: ContextmenuStore['rootMenu'] = {isMenu: true, menu: null, items: []};
	const selections: ContextmenuStore['selections'] = [];

	const {subscribe, update} = writable({open: false, items: {}, x: 0, y: 0});

	const store: ContextmenuStore = {
		subscribe,
		rootMenu,
		selections,
		action: contextmenuAction,
		open: (items, x, y) => {
			selections.length = 0;
			update(($state) => ({...$state, open: true, items, x, y}));
		},
		close: () => update(($state) => ({...$state, open: false})),
		activateSelected: () => {
			const selected = last(selections);
			if (!selected) return;
			if (selected.isMenu) {
				store.expandSelected();
			} else {
				store.close();
				selected.action();
			}
		},
		// Instead of diffing, this does the simple thing and
		// deselects everything and then re-creates the list of selections.
		// Could be improved but it's fine because we're using mutation and the N is very small,
		// and it allows us to have a single code path for the various selection methods.
		selectItem: (item) => {
			if (last(selections) === item) return;
			for (const s of selections) s.selected = false;
			selections.length = 0;
			let i: ItemState | RootMenuState = item;
			do {
				i.selected = true;
				selections.unshift(i);
			} while ((i = i.menu) && i.menu);
			update(($) => ({...$}));
		},
		collapseSelected: () => {
			if (selections.length <= 1) return;
			const deselected = selections.pop()!;
			deselected.selected = false;
			update(($) => ({...$}));
		},
		expandSelected: () => {
			const parent = last(selections);
			if (!parent?.isMenu) return;
			const selected = parent.items[0];
			selected.selected = true;
			selections.push(selected);
			update(($) => ({...$}));
		},
		selectNext: () => {
			if (!selections.length) return store.selectFirst();
			const item = last(selections)!;
			const index = item.menu.items.indexOf(item);
			store.selectItem(item.menu.items[index === item.menu.items.length - 1 ? 0 : index + 1]);
		},
		selectPrevious: () => {
			if (!selections.length) return store.selectLast();
			const item = last(selections)!;
			const index = item.menu.items.indexOf(item);
			store.selectItem(item.menu.items[index === 0 ? item.menu.items.length - 1 : index - 1]);
		},
		selectFirst: () => store.selectItem((last(selections)?.menu || rootMenu).items[0]),
		selectLast: () => store.selectItem(last((last(selections)?.menu || rootMenu).items)!),
		addEntry: (action) => {
			const menu = (getContext(CONTEXTMENU_STATE_KEY) as SubmenuState | undefined) || rootMenu;
			const entry: EntryState = {isMenu: false, menu, selected: false, action};
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
			onDestroy(() => {
				menu.items.length = 0;
			});
			return submenu;
		},
	};
	return store;
};

// The dataset key must not have capital letters or dashes or it'll differ between JS and DOM:
// https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/dataset
const CONTEXTMENU_DATASET_KEY = 'contextmenu';
const CONTEXTMENU_DOM_QUERY = `[data-${CONTEXTMENU_DATASET_KEY}],a`;
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
export const onContextmenu = (
	e: MouseEvent,
	contextmenu: ContextmenuStore,
	excludeEl?: HTMLElement,
): void | false => {
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

const CONTEXTMENU_STORE_KEY = Symbol();
export const setContextmenu = (contextmenu: ContextmenuStore): void =>
	setContext(CONTEXTMENU_STORE_KEY, contextmenu);
export const getContextmenu = (): ContextmenuStore => getContext(CONTEXTMENU_STORE_KEY);
