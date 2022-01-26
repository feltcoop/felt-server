import {writable, get, type Readable, type StartStopNotifier} from 'svelte/store';
import {isEditable} from '@feltcoop/felt/util/dom.js';
import {clamp} from '@feltcoop/felt/util/maths.js';
import {getContext, setContext} from 'svelte';

interface ContextmenuItems {
	[key: string]: any; // TODO types
}

type ItemState = MenuState | EntryState;
interface EntryState {
	// TODO action callback or event?
	menu: false;
	selected: boolean;
}
interface MenuState {
	// TODO action callback or event?
	menu: true;
	selected: boolean;
	expanded: boolean;
	// TODO is `entries` what we want? maybe swap with `ItemState`, so `items` and `EntryState`?
	items: ItemState[];
}

export interface Contextmenu {
	open: boolean;
	// TODO not sure about this, currently they're magic keys, maybe keys on `ui`?
	// so could they be addressed by `name || id`? e.g. `'personaSelection'`
	// maybe they should be blocks and block ids? or both?
	items: ContextmenuItems;
	// the 0th array item is the the only guaranteed one; submenus are subsequent items
	selections: number[];
	menu: MenuState;
	count: number;
	x: number;
	y: number;
}

export interface ContextmenuStore extends Readable<Contextmenu> {
	open(items: ContextmenuItems, x: number, y: number): void;
	close(): void;
	selectEntry(entry: EntryState): void;
	selectSubmenu(submenu: MenuState): void;
	collapseSelected(): void; // removes one
	expandSelected(): void; // opens the selected submenu
	selectNext(): void; // advances to the next of the latest
	selectPrevious(): void; // removes one
	action: typeof contextmenuAction;
	addRootMenu(): MenuState;
	addItem(): EntryState;
	addSubmenu(): MenuState;
}

const logSelections = (selections: number[]) => {
	console.log(
		'selections',
		selections.map((s, i) => `${i}__${s}  `),
	);
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
		selectEntry: (entry) => {
			update(($state) => {
				const {length} = $state.selections;
				console.log('\n\n\nSELECT entry, length', entry, length);
				// ignore `menuIndex` overflowing the max
				let selections;
				if (menuIndex <= length) {
					selections = $state.selections.slice(0, menuIndex + 1);
					selections[selections.length - 1] = itemIndex;
					console.log('selectionsB, menuIndex', selections.length, menuIndex);
				} else {
					// TODO handle if `menuIndex` is less than length - 1
					const item = $state.selections[length - 1];
					if (item === itemIndex) return $state;
					selections = $state.selections.slice(0, -1);
					$state.selections[length - 1] = clamp(itemIndex, 0, item.count - 1); // just clamp if it's bad data
					console.log('selectionsC, item', selections, item);
				}
				logSelections(selections);
				return {...$state, selections};
			});
		},
		selectSubmenu: (submenu) => {
			update(($state) => {
				const {length} = $state.selections;
				console.log('\n\n\nSELECT submenu, length', submenu, length);
				// ignore `menuIndex` overflowing the max
				let selections;
				if (menuIndex >= length - 1) {
					// TODO the count?
					selections = [...$state.selections, {count: 4, index: null}];
					console.log('selectionsA', selections);
				} else if (menuIndex <= length) {
					if ($state.selections[menuIndex].index === itemIndex) return $state;
					selections = $state.selections.slice(0, menuIndex + 1);
					selections[selections.length - 1] = itemIndex;
					console.log('selectionsB, menuIndex', selections.length, menuIndex);
				} else {
					// TODO handle if `menuIndex` is less than length - 1
					const item = $state.selections[length - 1];
					if (item === itemIndex) return $state;
					selections = $state.selections.slice(0, -1);
					item.index = clamp(itemIndex, 0, item.count - 1); // just clamp if it's bad data
					console.log('selectionsC, item', selections, item);
				}
				logSelections(selections);
				return {...$state, selections};
			});
		},
		collapseSelected: () => {
			update(($state) => {
				if (!$state.selections.length) return $state;
				return {...$state, selections: $state.selections.slice(0, -1)};
			});
		},
		expandSelected: () => {
			// TODO how does this work? need to detect if the selected one is a submenu,
			// and if so select the `menuItem+1` at `itemIndex=0`
			console.log('EXPAND SELECTED');
			update(($state) => {
				const {selections} = $state;
				if (!selections.length) return $state;
				return {...$state, selections: selections.concat(0)};
			});
		},
		selectNext: () => {
			update(($state) => {
				const {length} = $state.selections;
				const selections = $state.selections.slice(0, -1);
				const item = length ? {...$state.selections[length - 1]} : {index: null, count: 4};
				const index = item.index === null ? 0 : item.index === item.count - 1 ? 0 : item.index + 1;
				selections.push(index);
				logSelections(selections);
				return {...$state, selections};
			});
		},
		selectPrevious: () => {
			update(($state) => {
				const {length} = $state.selections;
				const selections = $state.selections.slice(0, -1);
				const item = length ? {...$state.selections[length - 1]} : {index: null, count: 4};
				const index =
					item.index === null ? item.count - 1 : item.index === 0 ? item.count - 1 : item.index - 1;
				selections.push(index);
				logSelections(selections);
				return {...$state, selections};
			});
		},
		action: contextmenuAction,
		addRootMenu: () => {
			const menu: MenuState = {menu: true, selected: false, expanded: false, items: []};
			get(store).menu = menu; // TODO mutation is good here right?
			setContext('contextmenuState', menu); // TODO extract
			console.log('addRootMenu', menu);
			return menu;
		},
		addItem: () => {
			const menu = getContext('contextmenuState') as MenuState; // TODO extract
			const entry: EntryState = {menu: false, selected: false};
			console.log('addItem', menu, entry);
			menu.items.push(entry);
			return entry;
		},
		addSubmenu: () => {
			const menu = getContext('contextmenuState') as MenuState; // TODO extract
			const submenu: MenuState = {menu: true, selected: false, expanded: false, items: []};
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
