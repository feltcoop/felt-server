import {writable, type Readable} from 'svelte/store';

export interface Mutable<T> {
	subscribe: Readable<{value: T}>['subscribe'];
	update(updater?: MutableUpdater<T>): void;
}

export interface MutableUpdater<T> {
	(value: T): void; // no return value
}

export const mutable = <T>(value: T): Mutable<T> => {
	let swap = false;
	const a = {value};
	const b = {value};

	const {subscribe, set} = writable<{value: T}>(a);

	return {
		subscribe,
		update: (updater) => {
			updater?.(value);
			set((swap = !swap) ? b : a);
		},
	};
};
