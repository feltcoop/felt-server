import {browser} from '$app/env';
import type {Mutable, Writable} from '@feltcoop/svelte-gettable-stores';

export const locallyStored = <T extends Writable<U> | Mutable<U>, U>(
	store: T,
	key: string,
	serialize: (v: U) => any,
	deserialize: (v: any) => U,
): T => {
	if (!browser) return store;
	const defaultValue = []; // TODO
	// TODO BLOCK is this right, set it immediately?
	const loaded = loadFromStorage(key, defaultValue); // TODO BLOCK also validate?
	// TODO BLOCK should this always set? how to efficiently get the default?
	// should the default already be in the store? return undefined and make default value optional to loadFromStorage?
	if (loaded !== defaultValue) ('swap' in store ? store.swap : store.set)(deserialize(loaded));
	const unsubscribe = store.subscribe((value) => {
		// TODO BLOCK batch these over a frame, `batchBy(key, () => ...)`
		console.log(`CHANGED value`, value);
		console.log(`'swap' in store ? value.value : value`, 'swap' in store ? value.value : value);
		setInStorage(key, serialize('swap' in store ? value.value : value));
	});
	// TODO BLOCK or derived?
	const subscribe: T['subscribe'] = (run: any, invalidate: any) => {
		const unsubscribe2 = store.subscribe(run, invalidate);
		console.log('SUBSCRIBING');
		return () => {
			console.log('UNSUBSCRIBING');
			unsubscribe();
			unsubscribe2();
		};
	};
	return {...store, subscribe};
};

/**
 * Loads `key` and falls back to `defaultValue`.
 * If `validate` is provided and throws, it removes the `key` and returns `undefined`.
 * @param key
 * @param defaultValue
 * @param validate
 * @returns
 */
export const loadFromStorage = <T>(
	key: string,
	defaultValue: T,
	validate?: (value: any) => asserts value is T,
): T => {
	console.log('LOAD FROM STORAGE', key);
	const stored = localStorage.getItem(key);
	if (!stored) return defaultValue;
	try {
		const parsed = JSON.parse(stored);
		validate?.(parsed);
		return parsed;
	} catch (err) {
		localStorage.removeItem(key);
		return defaultValue;
	}
};

/**
 * Sets `value` at `key`.
 * Importantly, if `value` is `undefined` the `key` is removed,
 * but a `value` of `null` is stored.
 * @param key
 * @param value
 */
export const setInStorage = (key: string, value: any): void => {
	console.log('SET IN STORAGE', key);
	if (value === undefined) {
		localStorage.removeItem(key);
	} else {
		localStorage.setItem(key, JSON.stringify(value));
	}
};
