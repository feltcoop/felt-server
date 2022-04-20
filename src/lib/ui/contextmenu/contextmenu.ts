import {writable, type Readable, type Writable} from 'svelte/store';
import {isEditable} from '@feltcoop/felt/util/dom.js';
import {last} from '@feltcoop/felt/util/array.js';
import {getContext, onDestroy, setContext, type SvelteComponent} from 'svelte';

// Items with `undefined` props are ignored.
export type ContextmenuItems = Array<[typeof SvelteComponent, object | null | undefined]>;

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
	layout: Readable<{width: number; height: number}>;
	action: typeof contextmenuAction;
	open: (items: ContextmenuItems, x: number, y: number) => void;
	close: () => void;
	activateSelected: () => void; // removes one
	selectItem: (item: ItemState) => void;
	collapseSelected: () => void; // removes one
	expandSelected: () => void; // opens the selected submenu
	selectNext: () => void; // advances to the next of the latest
	selectPrevious: () => void; // removes one
	selectFirst: () => void; // advances to the next of the latest
	selectLast: () => void; // removes one
	addEntry: (action: ContextmenuAction) => EntryState;
	addSubmenu: () => SubmenuState;
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
export const createContextmenuStore = (
	layout: Readable<{width: number; height: number}>,
): ContextmenuStore => {
	const rootMenu: ContextmenuStore['rootMenu'] = {isMenu: true, menu: null, items: []};
	const selections: ContextmenuStore['selections'] = [];

	const {subscribe, update} = writable<Contextmenu>({open: false, items: [], x: 0, y: 0});

	const store: ContextmenuStore = {
		subscribe,
		rootMenu,
		selections,
		layout,
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
			const menu = getContext<SubmenuState | undefined>(CONTEXTMENU_STATE_KEY) || rootMenu;
			const entry: EntryState = {isMenu: false, menu, selected: false, action};
			menu.items.push(entry);
			onDestroy(() => {
				menu.items.length = 0;
			});
			return entry;
		},
		addSubmenu: () => {
			const menu = getContext<SubmenuState | undefined>(CONTEXTMENU_STATE_KEY) || rootMenu;
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
const contextmenuCache = new Map<string, ContextmenuItems>();
let cacheKeyCounter = 0;

const contextmenuAction = (el: HTMLElement | SVGElement, params: ContextmenuItems | null) => {
	if (!params) return;
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
	LinkContextmenu?: typeof SvelteComponent,
): undefined | false => {
	if (e.shiftKey) return;
	e.stopPropagation();
	e.preventDefault();
	const target = e.target as HTMLElement | SVGElement;
	const items = queryContextmenuItems(target, LinkContextmenu);
	if (!items || isEditable(target) || excludeEl?.contains(target)) return;
	// TODO dispatch a UI event, like OpenContextmenu
	contextmenu.open(items, e.clientX, e.clientY);
	return false; // TODO remove this if it doesn't fix FF mobile (and update the `false` return value)
};

const queryContextmenuItems = (
	target: HTMLElement | SVGElement,
	LinkContextmenu: typeof SvelteComponent | undefined,
): null | ContextmenuItems => {
	let items: null | ContextmenuItems = null;
	let el: HTMLElement | SVGElement | null | undefined = target;
	let cacheKey: string, cached: ContextmenuItems;
	while ((el = el?.closest(CONTEXTMENU_DOM_QUERY))) {
		if ((cacheKey = el.dataset[CONTEXTMENU_DATASET_KEY]!)) {
			if (!items) items = [];
			cached = contextmenuCache.get(cacheKey)!;
			for (const item of cached) {
				// ignore `undefined` props to support conditional declarations, but keep `null` ones
				if (item[1] === undefined) continue;
				// preserve bubbling order
				if (!items.some((i) => i[0] === item[0])) {
					items.push(item);
				}
			}
		}
		if (LinkContextmenu && el.tagName === 'A') {
			if (!items) items = [];
			items.push([LinkContextmenu, {href: (el as HTMLAnchorElement).href}]);
		}
		el = el.parentElement;
	}
	return items;
};

const CONTEXTMENU_STORE_KEY = Symbol();
export const setContextmenu = (contextmenu: ContextmenuStore): void =>
	setContext(CONTEXTMENU_STORE_KEY, contextmenu);
export const getContextmenu = (): ContextmenuStore => getContext(CONTEXTMENU_STORE_KEY);

const CONTEXTMENU_DIMENSIONS_STORE_KEY = Symbol();
export const setContextmenuDimensions = (): Writable<{width: number; height: number}> => {
	const dimensions = writable({width: 0, height: 0});
	setContext(CONTEXTMENU_DIMENSIONS_STORE_KEY, dimensions);
	return dimensions;
};
export const getContextmenuDimensions = (): Writable<{width: number; height: number}> =>
	getContext(CONTEXTMENU_DIMENSIONS_STORE_KEY);
