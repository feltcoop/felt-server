import type {Mutable, Writable} from '@feltcoop/svelte-gettable-stores';
import {identity} from '@feltcoop/felt/util/function.js';
import type {Json} from '@feltcoop/felt/util/json.js';

import {loadFromStorage, setInStorage} from '$lib/ui/localStorage';

// TODO problem is this doesn't compose with custom stores that internally use `set` from a writable

// TODO ideally this type would work with `any` return values, not the default `void`,
// so custom stores can have whatever impl
type Storable<TValue> = Writable<TValue> | Mutable<TValue>;

/**
 * Mutates `store`, wrapping the common store change functions (set/update and mutate/swap)
 * with versions that write to `localStorage`,
 * and initializes the store value from storage if available.
 *
 * The change functions are overridden because we want to ensure
 * stores can be unsubscribed to go cold and get garbage collected.
 * There may be a way to get the best of both worlds and use `subscribe`.
 *
 * TODO try to improve the type so they need fewer or zero manual declarations
 * @param store
 * @param key localStorage key
 * @param toJson
 * @param fromJson
 * @returns
 */
export const locallyStored = <TStore extends Storable<TValue>, TValue, TJson extends Json>(
	store: TStore,
	key: string,
	toJson: (v: TValue) => TJson = identity as any,
	fromJson: (v: TJson) => TValue | undefined = identity as any,
): TStore & {getJson: () => TJson} => {
	// Support stores that have at least one of the following methods:
	let set: undefined | Writable<TValue>['set'];
	let update: undefined | Writable<TValue>['update'];
	let mutate: undefined | Mutable<TValue>['mutate'];
	let swap: undefined | Mutable<TValue>['swap'];
	const mutable = 'mutate' in store;
	if (mutable) {
		mutate = store.mutate;
		swap = store.swap;
	} else {
		set = store.set;
		update = store.update;
	}

	let json = loadFromStorage(key) as TJson;
	if (json !== undefined) {
		const value = fromJson(json);
		if (value !== undefined) {
			if (set) set(value);
			else if (update) update(() => value);
			else if (swap) swap(value);
			else throw Error('invalid store, expected either a set, update, or swap function');
		}
	}

	// TODO debounce by key to prevent setting more than once in the same frame
	const save = (value: any) => {
		// TODO should this check if the value changed?
		setInStorage(key, (json = toJson(value)));
	};

	(store as TStore & {getJson: () => TJson}).getJson = (): TJson =>
		json === undefined ? (json = toJson(mutable ? store.get().value : store.get())) : json;
	if (mutable) {
		if (mutate) {
			store.mutate = function () {
				const returned = (mutate as any).apply(this, arguments); // eslint-disable-line prefer-rest-params
				save((store as any).get().value);
				return returned;
			};
		}
		if (swap) {
			store.swap = function () {
				const returned = (swap as any).apply(this, arguments); // eslint-disable-line prefer-rest-params
				save((store as any).get().value);
				return returned;
			};
		}
	} else {
		if (set) {
			store.set = function () {
				const returned = (set as any).apply(this, arguments); // eslint-disable-line prefer-rest-params
				save(store.get());
				return returned;
			};
		}
		if (update) {
			store.update = function () {
				const returned = (update as any).apply(this, arguments); // eslint-disable-line prefer-rest-params
				save(store.get());
				return returned;
			};
		}
	}
	return store as TStore & {getJson: () => TJson};
};

export const locallyStoredMap = <TStore extends Storable<TValue>, TValue, TJson extends Json>(
	store: TStore,
	key: string,
): TStore & {getJson: () => TJson} =>
	locallyStored(
		store,
		key,
		($v: any) => Array.from($v.entries()) as any,
		(json) => new Map(json) as any,
	);
