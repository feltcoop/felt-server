import {writable, type Readable, type Writable} from '@feltcoop/svelte-gettable-stores';
import {getContext, onDestroy, setContext, type SvelteComponent} from 'svelte';
import type {Result} from '@feltcoop/felt';

// Items with `undefined` props are ignored.
export type ContextmenuItems = Array<[typeof SvelteComponent, object | null | undefined]>;

type ActivateResult = Result<any, {message?: string}> | any; // eslint-disable-line @typescript-eslint/no-redundant-type-constituents

export type ItemState = SubmenuState | EntryState;
export interface EntryState {
	isMenu: false;
	menu: SubmenuState | RootMenuState;
	selected: boolean;
	action: ContextmenuAction;
	pending: boolean;
	errorMessage: string | null;
	promise: Promise<any> | null;
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
	(): void | Promise<ActivateResult>;
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
	activate: (item: ItemState) => boolean | Promise<ActivateResult>;
	activateSelected: () => boolean | Promise<ActivateResult>;
	select: (item: ItemState) => void;
	collapseSelected: () => void;
	expandSelected: () => void; // opens the selected submenu
	selectNext: () => void;
	selectPrevious: () => void;
	selectFirst: () => void;
	selectLast: () => void;
	addEntry: (action: ContextmenuAction) => EntryState;
	addSubmenu: () => SubmenuState;
	// These two properties are mutated internally.
	// If you need reactivity, use `$contextmenu` in a reactive statement to react to all changes, and
	// then access the mutable non-reactive  `contextmenu.rootMenu` and `contextmenu.selections`.
	// See `ContextmenuEntry.svelte` and `ContextmenuSubmenu.svelte` for reactive usage examples.
	rootMenu: RootMenuState;
	selections: ItemState[];
}

export interface ContextmenuStoreOptions {
	layout: Readable<{width: number; height: number}>;
	onError: (message: string | undefined) => void;
}

const CONTEXTMENU_STATE_KEY = Symbol();

/**
 * Creates a `contextmenu` store.
 * For external usage see `use:contextmenu.action` scattered throughout the app,
 * and for internal usage see `Contextmenu.svelte`.
 * @returns
 */
export const createContextmenuStore = ({
	layout,
	onError,
}: ContextmenuStoreOptions): ContextmenuStore => {
	const rootMenu: ContextmenuStore['rootMenu'] = {isMenu: true, menu: null, items: []};
	const selections: ContextmenuStore['selections'] = [];

	const {update, set: _set, ...rest} = writable<Contextmenu>({open: false, items: [], x: 0, y: 0});

	// TODO instead of this, use a store per entry probably
	const forceUpdate = () => update(($) => ({...$}));

	// TODO not mutation, probably
	const resetItems = (items: ItemState[]): void => {
		for (const item of items) {
			if (item.isMenu) {
				resetItems(item.items);
			} else {
				if (item.promise !== null) item.promise = null;
				if (item.errorMessage !== null) item.errorMessage = null;
			}
		}
	};

	const store: ContextmenuStore = {
		...rest,
		rootMenu,
		selections,
		layout,
		action: contextmenuAction,
		open: (items, x, y) => {
			selections.length = 0;
			update(($state) => ({...$state, open: true, items, x, y}));
		},
		close: () =>
			update(($state) => {
				if (!$state.open) return $state;
				resetItems(rootMenu.items);
				return {...$state, open: false};
			}),
		activate: (item) => {
			if (item.isMenu) {
				store.expandSelected();
			} else {
				const returned = item.action();
				if (returned?.then) {
					item.pending = true;
					item.errorMessage = null;
					const promise = (item.promise = returned
						.then(
							(result) => {
								if (promise !== item.promise) return;
								if (typeof result?.ok === 'boolean') {
									if (result.ok) {
										store.close();
									} else {
										const message = typeof result.message === 'string' ? result.message : undefined;
										item.errorMessage = message ?? 'unknown error';
										onError?.(message);
									}
								} else {
									store.close();
								}
								return result;
							},
							(err) => {
								if (promise !== item.promise) return;
								const message = typeof err?.message === 'string' ? err.message : undefined;
								item.errorMessage = message ?? 'unknown error';
								onError?.(message);
							},
						)
						.finally(() => {
							if (promise !== item.promise) return;
							item.pending = false;
							item.promise = null;
							forceUpdate();
						}));
					forceUpdate();
					return item.promise;
				}
				store.close();
			}
			return true;
		},
		activateSelected: () => {
			const selected = selections.at(-1);
			if (!selected) return false;
			return store.activate(selected);
		},
		// Instead of diffing, this does the simple thing and
		// deselects everything and then re-creates the list of selections.
		// Could be improved but it's fine because we're using mutation and the N is very small,
		// and it allows us to have a single code path for the various selection methods.
		select: (item) => {
			if (selections.at(-1) === item) return;
			for (const s of selections) s.selected = false;
			selections.length = 0;
			let i: ItemState | RootMenuState = item;
			do {
				i.selected = true;
				selections.unshift(i);
			} while ((i = i.menu) && i.menu);
			forceUpdate();
		},
		collapseSelected: () => {
			if (selections.length <= 1) return;
			const deselected = selections.pop()!;
			deselected.selected = false;
			forceUpdate();
		},
		expandSelected: () => {
			const parent = selections.at(-1);
			if (!parent?.isMenu) return;
			const selected = parent.items[0];
			selected.selected = true;
			selections.push(selected);
			forceUpdate();
		},
		selectNext: () => {
			if (!selections.length) return store.selectFirst();
			const item = selections.at(-1)!;
			const index = item.menu.items.indexOf(item);
			store.select(item.menu.items[index === item.menu.items.length - 1 ? 0 : index + 1]);
		},
		selectPrevious: () => {
			if (!selections.length) return store.selectLast();
			const item = selections.at(-1)!;
			const index = item.menu.items.indexOf(item);
			store.select(item.menu.items[index === 0 ? item.menu.items.length - 1 : index - 1]);
		},
		selectFirst: () => store.select((selections.at(-1)?.menu || rootMenu).items[0]),
		selectLast: () => store.select((selections.at(-1)?.menu || rootMenu).items.at(-1)!),
		addEntry: (action) => {
			const menu = getContext<SubmenuState | undefined>(CONTEXTMENU_STATE_KEY) || rootMenu;
			const entry: EntryState = {
				isMenu: false,
				menu,
				selected: false,
				action,
				pending: false,
				errorMessage: null,
				promise: null,
			};
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
 * Opens the contextmenu, if appropriate,
 * querying the menu items from the DOM starting at the event target.
 * @param contextmenu
 * @returns An event handler that opens the contextmenu, unless the target is inside `excludeEl`.
 */
export const openContextmenu = (
	target: HTMLElement | SVGElement,
	x: number,
	y: number,
	contextmenu: ContextmenuStore,
	LinkContextmenu?: typeof SvelteComponent,
): void => {
	const items = queryContextmenuItems(target, LinkContextmenu);
	if (!items) return;
	// TODO dispatch a UI event, like OpenContextmenu
	contextmenu.open(items, x, y);
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
export const setContextmenu = (contextmenu: ContextmenuStore): ContextmenuStore =>
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
