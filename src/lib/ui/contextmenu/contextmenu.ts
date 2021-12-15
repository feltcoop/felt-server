import {writable} from 'svelte/store';
import type {Readable, StartStopNotifier} from 'svelte/store';
import type {Entity} from '$lib/vocab/entity/entity';
// import type { Flavored } from '@feltcoop/felt';

// TODO delete or refactor
// export interface Thing<T extends Thing = Thing<any>> {
// 	type: ThingType<Thing>;
// 	id: Id<T>;
// }
// export type ThingType<T = Thing> = Flavored<string, 'ThingType'> & {__thing?: T};
// export type Id<T = Thing> = Flavored<string, 'Id'> & {__thing?: T};

export interface ContextMenu {
	opened: boolean;
	entities: Entity[]; // TODO not sure about this
	x: number;
	y: number;
}

export interface ContextMenuStore extends Readable<ContextMenu>, Entity<ContextMenuStore> {
	type: 'ContextMenuStore';
	title: string;
	open(entities: Entity[], x: number, y: number): void;
	close(): void;
}

export const createContextMenuStore = (
	initialValue: ContextMenu = {opened: false, entities: [], x: 0, y: 0},
	title = 'context menu',
	start?: StartStopNotifier<ContextMenu>,
): ContextMenuStore => {
	const {subscribe, update} = writable(initialValue, start);

	return {
		type: 'ContextMenuStore',
		// id: createId(),
		title,
		subscribe,
		open: (entities, x, y) => {
			update(($entities) => ({...$entities, opened: true, entities, x, y}));
		},
		close: () => {
			// TODO what if instead we don't clear the entities? so you could easily re-open? hmm
			// I like the idea of a `reopen` command that takes no params
			update(($entities) => ({...$entities, opened: false, entities: []}));
		},
	};
};
