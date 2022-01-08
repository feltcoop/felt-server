import {writable, type Readable, type StartStopNotifier} from 'svelte/store';
import {isEditable} from '@feltcoop/felt/util/dom.js';

interface ContextmenuEntities {
	[key: string]: any; // TODO types
}

export interface Contextmenu {
	opened: boolean;
	// TODO not sure about this, currently they're magic keys, maybe keys on `ui`?
	// so could they be addressed by `name || id`? e.g. `'personaSelection'`
	// maybe they should be blocks and block ids? or both?
	entities: null | ContextmenuEntities;
	x: number;
	y: number;
}

export interface ContextmenuStore extends Readable<Contextmenu> {
	open(entities: ContextmenuEntities, x: number, y: number): void;
	close(): void;
}

export const createContextmenuStore = (
	initialValue: Contextmenu = {opened: false, entities: null, x: 0, y: 0},
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

export const queryContextmenuEntities = (
	target: HTMLElement | SVGElement,
): null | ContextmenuEntities => {
	let entities: null | ContextmenuEntities = null;
	let el: HTMLElement | SVGElement | null = target;
	while ((el = el && el.closest('[data-entity],a'))) {
		let value: any;
		if ((value = el.dataset.entity)) {
			if (!entities) entities = {};
			console.log('value', value);
			value = JSON.parse(value);
			for (const key in value) {
				if (!(key in entities)) entities[key] = value[key]; // preserve bubbling order
			}
		}
		if (el.tagName === 'A') {
			if (!entities) entities = {};
			entities.link = (el as HTMLAnchorElement).href;
		}
		if ('entityStopPropagation' in el.dataset) break;
		el = el.parentElement;
	}
	return entities;
};

export const onContextmenu = (contextmenu: ContextmenuStore) => (e: MouseEvent) => {
	if (e.ctrlKey) return; // defer control!
	const target = e.target as HTMLElement;
	if (isEditable(target)) return;
	const entities = queryContextmenuEntities(target);
	if (!entities) return;
	e.stopPropagation();
	e.preventDefault();
	// TODO dispatch a UI event, like OpenContextmenu
	contextmenu.open(entities, e.clientX, e.clientY);
};
