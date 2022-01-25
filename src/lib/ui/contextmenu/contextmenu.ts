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
	// the 0th array item is the the only guaranteed one; submenus are subsequent items
	selections: {count: number; index: number}[];
	count: number;
	x: number;
	y: number;
}

export interface ContextmenuStore extends Readable<Contextmenu> {
	open(items: ContextmenuItems, x: number, y: number): void;
	close(): void;
	selectItem(menuIndex: number, itemIndex: number): void;
	selectSubmenuItem(menuIndex: number, itemIndex: number): void;
	closeSelected(): void; // removes one
	openSelected(): void; // opens the selected submenu
	selectNext(): void; // advances to the next of the latest
	selectPrevious(): void; // removes one
	action: typeof contextmenuAction;
}

export const createContextmenuStore = (
	initialValue: Contextmenu = {open: false, items: {}, selections: [], x: 0, y: 0, count: 0},
	start?: StartStopNotifier<Contextmenu>,
): ContextmenuStore => {
	const {subscribe, update} = writable(initialValue, start);

	return {
		subscribe,
		open: (items, x, y) => {
			update(($state) => ({...$state, open: true, items, x, y}));
		},
		close: () => {
			update(($state) => ({...$state, open: false, selections: []}));
		},
		selectItem: (menuIndex, itemIndex) => {
			update(($state) => {
				const {length} = $state.selections;
				console.log('\n\n\nITEM menuIndex, itemIndex, length', menuIndex, itemIndex, length);
				// ignore `menuIndex` overflowing the max
				let selections;
				if (menuIndex <= length) {
					selections = $state.selections.slice(0, menuIndex + 1);
					selections[selections.length - 1] = {
						...selections[selections.length - 1],
						index: itemIndex,
					};
					console.log('selectionsB, menuIndex', selections.length, menuIndex);
				} else {
					// TODO handle if `menuIndex` is less than length - 1
					const item = {...$state.selections[length - 1]};
					if (item.index === itemIndex) return $state;
					selections = $state.selections.slice(0, -1);
					// TODO use `clamp` after upgrading Felt
					item.index = Math.min(Math.max(0, itemIndex), item.count - 1); // just clamp if it's bad data
					console.log('selectionsC, item', selections, item);
				}
				return {...$state, selections};
			});
		},
		selectSubmenuItem: (menuIndex, itemIndex) => {
			update(($state) => {
				const {length} = $state.selections;
				console.log(
					'\n\n\nSUBMENU ITEM menuIndex, itemIndex, length',
					menuIndex,
					itemIndex,
					length,
				);
				// ignore `menuIndex` overflowing the max
				let selections;
				if (menuIndex >= length - 1) {
					selections = [...$state.selections, {count: $state.count, index: itemIndex}];
					console.log('selectionsA', selections);
				} else if (menuIndex <= length) {
					if ($state.selections[menuIndex].index === itemIndex) return $state;
					selections = $state.selections.slice(0, menuIndex + 1);
					selections[selections.length - 1] = {
						...selections[selections.length - 1],
						index: itemIndex,
					};
					console.log('selectionsB, menuIndex', selections.length, menuIndex);
				} else {
					// TODO handle if `menuIndex` is less than length - 1
					const item = {...$state.selections[length - 1]};
					if (item.index === itemIndex) return $state;
					selections = $state.selections.slice(0, -1);
					// TODO use `clamp` after upgrading Felt
					item.index = Math.min(Math.max(0, itemIndex), item.count - 1); // just clamp if it's bad data
					console.log('selectionsC, item', selections, item);
				}
				return {...$state, selections};
			});
		},
		closeSelected: () => {
			update(($state) => {
				if (!$state.selections.length) return $state;
				return {...$state, selections: $state.selections.slice(0, -1)};
			});
		},
		openSelected: () => {
			// TODO how does this work? need to detect if the selected one is a submenu,
			// and if so select the `menuItem+1` at `itemIndex=0`
			console.log('OPEN SELECTED');
			// update(($state) => {
			// 	if (!$state.selections.length) return $state;
			// 	return {...$state, selections: $state.selections.slice(0, -1)};
			// });
		},
		selectNext: () => {
			update(($state) => {
				const {length} = $state.selections;
				if (!length) return $state;
				const selections = $state.selections.slice(0, -1);
				const item = {...$state.selections[length - 1]};
				item.index = item.index === item.count - 1 ? 0 : item.index + 1;
				selections.push(item);
				return {...$state, selections};
			});
		},
		selectPrevious: () => {
			update(($state) => {
				const {length} = $state.selections;
				if (!length) return $state;
				const selections = $state.selections.slice(0, -1);
				const item = {...$state.selections[length - 1]};
				item.index = item.index === 0 ? item.index - 1 : 0;
				selections.push(item);
				return {...$state, selections};
			});
		},
		action: contextmenuAction,
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
