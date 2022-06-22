import {browser} from '$app/env';
import type {Mutable, Writable} from '@feltcoop/svelte-gettable-stores';
import {identity} from '@feltcoop/felt/util/function.js';
import type {Json} from '@feltcoop/felt/util/json.js';

// TODO BLOCK how to improve this type so we don't need manual declaration? or at least the duplicate?
// The problem I'm having is that `U` cannot be inferred.
export const locallyStored = <
	TStore extends {
		get: Writable<TValue>['get'] | Mutable<TValue>['get'];
		set?: Writable<TValue>['set'];
		update?: Writable<TValue>['update'];
		mutate?: Mutable<TValue>['mutate'];
		swap?: Mutable<TValue>['swap'];
	},
	TValue,
	TJson extends Json = Json,
>(
	store: TStore,
	key: string,
	toJson: (v: TValue) => TJson = identity as any,
	fromJson: (v: TJson) => TValue | undefined = identity as any,
): TStore & {getJson: () => TJson} => {
	// Support stores that have at least one of the following methods:
	const {set, update, mutate, swap} = store;

	let json = loadFromStorage(key) as TJson;
	if (json !== undefined) {
		const value = fromJson(json);
		if (value !== undefined) {
			if (set) set(value);
			else if (update) update(() => value);
			else if (swap) swap(value);
		}
	}

	// TODO BLOCK debounce by key to prevent setting more than once in the same frame
	const save = (value: any) => {
		// TODO BLOCK should this check if the value changed? would need the serialized version
		setInStorage(key, (json = toJson(value)));
	};
	const stored: TStore & {getJson: () => TJson} = {
		...store,
		getJson: (): TJson =>
			json === undefined
				? (json = toJson(mutate || swap ? (store.get() as any).value : store.get()))
				: json,
	};
	if (set) {
		stored.set = function () {
			set.apply(this, arguments as any); // eslint-disable-line prefer-rest-params
			save(store.get());
		};
	}
	if (update) {
		stored.update = function () {
			update.apply(this, arguments as any); // eslint-disable-line prefer-rest-params
			save(store.get());
		};
	}
	if (mutate) {
		stored.mutate = function () {
			mutate.apply(this, arguments as any); // eslint-disable-line prefer-rest-params
			save((store as any).get().value);
		};
	}
	if (swap) {
		stored.swap = function () {
			swap.apply(this, arguments as any); // eslint-disable-line prefer-rest-params
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
