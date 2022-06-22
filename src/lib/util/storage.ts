import {browser} from '$app/env';
import type {Mutable, Writable} from '@feltcoop/svelte-gettable-stores';
import {identity} from '@feltcoop/felt/util/function.js';
import type {Json} from '@feltcoop/felt/util/json.js';

export const locallyStored = <T extends Writable<U> | Mutable<U>, U, V extends Json = Json>(
	store: T,
	key: string,
	toJson: (v: U) => V = identity as any, // TODO maybe these should be optional
	fromJson: (v: V) => U = identity as any, // TODO maybe these should be optional
	// TODO BLOCK
	// validate: (v: any) => asserts v is U,
): T & {getJson: () => V} => {
	// Support stores that have at least one of the following methods:
	const {set, update, mutate, swap} = store as any as Record<
		string,
		((...args: any[]) => any) | undefined
	>;

	let json = loadFromStorage(key) as V; // TODO BLOCK also validate? would fix versioning breakages
	if (json !== undefined) {
		const value = fromJson(json);
		if (set) (store as any).set(value);
		else if (update) (store as any).update(() => value);
		else if (swap) (store as any).swap(value);
	}

	// TODO BLOCK debounce by key to prevent setting more than once in the same frame
	const save = (value: any) => {
		// TODO BLOCK should this check if the value changed? would need the serialized version
		setInStorage(key, (json = toJson(value)));
	};
	const stored: T & {getJson: () => V} = {
		...store,
		getJson: () =>
			json === undefined
				? (json = toJson(mutate || swap ? (store.get() as any).value : store.get()))
				: json,
	};
	if (set) {
		(store as any).set = (...args: any[]) => {
			set(...args);
			save(store.get());
		};
	}
	if (update) {
		(store as any).update = (...args: any[]) => {
			update(...args);
			save(store.get());
		};
	}
	if (mutate) {
		(store as any).mutate = (...args: any[]) => {
			mutate(...args);
			save((store as any).get().value);
		};
	}
	if (swap) {
		(store as any).swap = (...args: any[]) => {
			swap(...args);
			save((store as any).get().value);
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
