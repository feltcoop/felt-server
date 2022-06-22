import {browser} from '$app/env';
import type {Mutable, Writable} from '@feltcoop/svelte-gettable-stores';
import {identity} from '@feltcoop/felt/util/function.js';
import type {Json} from '@feltcoop/felt/util/json.js';

// TODO BLOCK support writable without `update` in the type
export const locallyStored = <T extends Writable<U> | Mutable<U>, U, V extends Json = Json>(
	store: T,
	key: string,
	toJson: (v: U) => V = identity as any, // TODO maybe these should be optional
	fromJson: (v: V) => U = identity as any, // TODO maybe these should be optional
): T & {getJson: () => V} => {
	const hasSet = 'set' in store;
	const hasUpdate = 'update' in store;
	const hasMutate = 'mutate' in store;
	const hasSwap = 'swap' in store;

	let json = loadFromStorage(key); // TODO BLOCK also validate?
	if (json !== undefined) {
		const value = fromJson(json);
		if (hasSet) store.set(value);
		else if (hasSwap) store.swap(value);
		else if (hasUpdate) (store as any).update(() => value); // TODO BLOCK typecast needed because of lack of support for writable without update, see above
	}

	// TODO BLOCK debounce by key to prevent setting more than once in the same frame
	const save = (value: any) => {
		// TODO BLOCK should this check if the value changed? would need the serialized version
		setInStorage(key, (json = toJson(value)));
	};
	const stored: T & {getJson: () => V} = {...store, getJson: () => json};
	// Support stores that have at least one of the following methods:
	if (hasSet) {
		const _set = store.set;
		store.set = (value) => {
			_set(value);
			save(value);
		};
	}
	if (hasUpdate) {
		const _update = store.update;
		store.update = (updater) => {
			const updated = updater(store.get());
			_update(() => updated);
			save(updated);
		};
	}
	if (hasMutate) {
		const _mutate = store.mutate;
		store.mutate = (mutator) => {
			const value = store.get().value;
			mutator?.(value);
			_mutate();
			save(value);
		};
	}
	if (hasSwap) {
		const _swap = store.swap;
		store.swap = (value) => {
			_swap(value);
			save(value);
		};
	}
	return stored;
};

/**
 * Loads `key` and parses it as JSON.
 * If `validate` is provided and throws, it removes the `key` and returns `undefined`.
 * @param key
 * @param validate
 * @returns
 */
export const loadFromStorage = <T extends Json>(
	key: string,
	validate?: (value: any) => asserts value is T,
): T | undefined => {
	if (!browser) return;
	console.log('LOAD FROM STORAGE', key);
	const stored = localStorage.getItem(key);
	if (!stored) return;
	try {
		const parsed = JSON.parse(stored);
		validate?.(parsed);
		return parsed;
	} catch (err) {
		localStorage.removeItem(key);
		return;
	}
};

/**
 * Sets `value` at `key`.
 * Importantly, if `value` is `undefined` the `key` is removed,
 * but a `value` of `null` is stored.
 * @param key
 * @param value
 */
export const setInStorage = (key: string, value: Json): void => {
	if (!browser) return;
	console.log('SET IN STORAGE', key);
	if (value === undefined) {
		localStorage.removeItem(key);
	} else {
		localStorage.setItem(key, JSON.stringify(value));
	}
};
