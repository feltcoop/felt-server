import {browser} from '$app/env';
import type {Mutable, Writable} from '@feltcoop/svelte-gettable-stores';
import {identity} from '@feltcoop/felt/util/function.js';
import type {Json} from '@feltcoop/felt/util/json.js';

// TODO BLOCK is the limitation that it won't save on `set/update/swap/mutate` a problem?
// should we override each of those too? then we wouldn't have to subscribe, right?
// we just intercept the values? but that wouldn't work for derived,
// but derived doesn't work for this anyway because there's no set? yeah derived makes no sense,
// nor does readable with its own `set` -- in that case it can use `loadFromStorage` directly

export const locallyStored = <T extends Writable<U> | Mutable<U>, U>(
	store: T,
	key: string,
	toJson: (v: U) => Json = identity as any,
	fromJson: (v: Json) => U = identity as any,
): T => {
	if (!browser) return store;
	const defaultValue = []; // TODO BLOCK
	// TODO BLOCK is this right, set it immediately?
	const loaded = loadFromStorage(key); // TODO BLOCK also validate?
	// TODO BLOCK should this always set? how to efficiently get the default?
	// should the default already be in the store? return undefined and make default value optional to loadFromStorage?
	if (loaded) ('swap' in store ? store.swap : store.set)(fromJson(loaded));
	// TODO BLOCK or derived?
	const subscribe: T['subscribe'] = (run: any, invalidate: any) => {
		const unsubscribe1 = store.subscribe((value) => {
			// TODO BLOCK batch these over a frame, `batchBy(key, () => ...)`
			console.log(`CHANGED value`, 'swap' in store ? value.value : value);
			setInStorage(key, toJson('swap' in store ? value.value : value));
		});
		const unsubscribe2 = store.subscribe(run, invalidate);
		console.log('SUBSCRIBING');
		return () => {
			console.log('UNSUBSCRIBING');
			unsubscribe1();
			unsubscribe2();
		};
	};
	return {...store, subscribe}; // TODO maybe add a getter for the json value?
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
	console.log('SET IN STORAGE', key);
	if (value === undefined) {
		localStorage.removeItem(key);
	} else {
		localStorage.setItem(key, JSON.stringify(value));
	}
};
