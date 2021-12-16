import {writable} from 'svelte/store';
import type {Readable, StartStopNotifier} from 'svelte/store';
import {isEditable} from '@feltcoop/felt/util/dom.js';

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

export const queryContextmenuEntityIds = (target: HTMLElement | SVGElement): string[] => {
	const ids: string[] = [];
	let el: HTMLElement | SVGElement | null = target;
	let stoppedPropagation = false;
	while ((el = el && el.closest('[data-entity],a'))) {
		let entity: any;
		if (!stoppedPropagation && (entity = el.dataset.entity)) {
			if (entity.includes(',')) {
				for (const id of entity.split(',')) {
					ids.push(id);
				}
			} else {
				ids.push(entity);
			}
			if ('entityStopPropagation' in el.dataset) {
				stoppedPropagation = true;
			}
		}
		if (el.tagName === 'A') {
			ids.push('link:' + (el as HTMLAnchorElement).href);
		}
		el = el.parentElement;
	}
	return ids;
};

export const onContextmenu = (contextmenu: ContextmenuStore) => (e: MouseEvent) => {
	if (e.ctrlKey) return; // defer control!
	const target = e.target as HTMLElement;
	if (isEditable(target)) return;
	const entities = queryContextmenuEntityIds(target);
	if (!entities.length) return;
	e.stopPropagation();
	e.preventDefault();
	// TODO dispatch a UI event, like open_contextmenu
	contextmenu.open(entities, e.clientX, e.clientY);
};
