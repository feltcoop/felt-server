import {writable, get, type Readable, type StartStopNotifier} from 'svelte/store';
import {isEditable} from '@feltcoop/felt/util/dom.js';
import {getContext, setContext} from 'svelte';

interface ContextmenuItems {
	[key: string]: any; // TODO types
}

type ItemState = MenuState | EntryState;
interface EntryState {
	// TODO action callback or event?
	isMenu: false;
	menu: MenuState | RootMenuState;
	selected: boolean;
}
// TODO rename to `SubmenuState` if it stays distinct from `RootMenuState`
interface MenuState {
	// TODO action callback or event?
	isMenu: true;
	menu: MenuState | RootMenuState;
	selected: boolean;
	expanded: boolean;
	// TODO is `entries` what we want? maybe swap with `ItemState`, so `items` and `EntryState`?
	items: ItemState[];
}
interface RootMenuState {
	isMenu: true;
	menu: null;
	items: ItemState[];
}

export interface Contextmenu {
	open: boolean;
	// TODO not sure about this, currently they're magic keys, maybe keys on `ui`?
	// so could they be addressed by `name || id`? e.g. `'personaSelection'`
	// maybe they should be blocks and block ids? or both?
	items: ContextmenuItems;
	// the 0th array item is the the only guaranteed one; submenus are subsequent items
	selections: ItemState[];
	menu: RootMenuState;
	count: number;
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
	addRootMenu(): RootMenuState;
	addEntry(): EntryState;
	addSubmenu(): MenuState;
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
		menu: null as any, // TODO ? should this property be nullable or do we not care?
		x: 0,
		y: 0,
		count: 0,
	},
	start?: StartStopNotifier<Contextmenu>,
): ContextmenuStore => {
	const store = writable(initialValue, start);
	const {subscribe, update} = store;

	return {
		subscribe,
		open: (items, x, y) => {
			update(($state) => ({...$state, open: true, items, x, y}));
		},
		close: () => {
			update(($state) => ({...$state, open: false, menu: null as any, selections: []}));
		},
		selectItem: (item) => {
			update(($state) => {
				const {selections} = $state;
				if (selections[selections.length - 1] === item) return $state;
				console.log('\n\n\nSELECT item, length', item, selections.length);
				for (const selection of selections) {
					selection.selected = false;
				}
				const nextSelections: ItemState[] = [item];
				item.selected = true;
				let parent: ItemState | RootMenuState = item;
				while ((parent = parent.menu)) {
					parent.selected = true;
					nextSelections.unshift(parent);
				}
				console.log('nextSelections', nextSelections);
				logSelections(nextSelections);
				return {...$state, selections: nextSelections};
			});
		},
		collapseSelected: () => {
			update(($state) => {
				const {selections} = $state;
				if (!selections.length) return $state;
				const deselected = selections[selections.length - 1];
				deselected.selected = false;
				return {...$state, selections: selections.slice(0, -1)};
			});
		},
		expandSelected: () => {
			update(($state) => {
				const {selections} = $state;
				if (!selections.length) return $state;
				const parent = selections[selections.length - 1];
				if (!parent.isMenu) return $state;
				const selected = parent.items[0];
				selected.selected = true;
				return {...$state, selections: selections.concat(selected)};
			});
		},
		selectNext: () => {
			update(($state) => ({...$state, selections: cycleSelections($state, true)}));
		},
		selectPrevious: () => {
			update(($state) => ({...$state, selections: cycleSelections($state, false)}));
		},
		action: contextmenuAction,
		addRootMenu: () => {
			const menu: RootMenuState = {isMenu: true, menu: null, items: []};
			get(store).menu = menu; // TODO mutation is good here right?
			setContext('contextmenuState', menu); // TODO extract
			console.log('addRootMenu', menu);
			return menu;
		},
		addEntry: () => {
			const menu = getContext('contextmenuState') as MenuState; // TODO extract
			const entry: EntryState = {isMenu: false, menu, selected: false};
			console.log('addEntry', menu, entry);
			menu.items.push(entry);
			return entry;
		},
		addSubmenu: () => {
			const menu = getContext('contextmenuState') as MenuState; // TODO extract
			const submenu: MenuState = {isMenu: true, menu, selected: false, expanded: false, items: []};
			menu.items.push(submenu);
			setContext('contextmenuState', submenu); // TODO extract
			console.log('addSubmenu', submenu);
			// TODO is this needed?
			// onDestroy(() => {
			// 	data.delete(submenu);
			// });
			return submenu;
		},
	};
};

const cycleSelections = ($state: Contextmenu, forward: boolean): ItemState[] => {
	const {selections} = $state;
	const deselected = selections[selections.length - 1] as ItemState | undefined;
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
	const nextSelections = selections.slice(0, -1);
	nextSelections.push(nextItem);
	logSelections(nextSelections);
	return nextSelections;
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
