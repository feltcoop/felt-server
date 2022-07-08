import type {Mutable, Writable} from '@feltcoop/svelte-gettable-stores';
import {identity} from '@feltcoop/felt/util/function.js';
import type {Json} from '@feltcoop/felt/util/json.js';

import {loadFromStorage, setInStorage} from '$lib/util/localStorage';

// TODO BLOCK problem is this doesn't compose with custom stores that internally use `set` from a writable

type Storable<TValue> = {
	get: Writable<TValue>['get'] | Mutable<TValue>['get'];
	set?: Writable<TValue>['set'];
	update?: Writable<TValue>['update'];
	mutate?: Mutable<TValue>['mutate'];
	swap?: Mutable<TValue>['swap'];
};

// TODO how to improve this type so we don't need manual declaration? or at least the duplicate?
// The problem I'm having is that `U` cannot be inferred.
/**
 * Mutates `store`, wrapping the common store change functions (set/update and mutate/swap)
 * with versions that write to `localStorage`,
 * and initializes the store value from storage if available.
 * @param store
 * @param key
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
	const {set, update, mutate, swap} = store;

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
		// TODO should this check if the value changed? would need the serialized version
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
			const returned = set.apply(this, arguments as any); // eslint-disable-line prefer-rest-params
			save(store.get());
			return returned;
		};
	}
	if (update) {
		stored.update = function () {
			const returned = update.apply(this, arguments as any); // eslint-disable-line prefer-rest-params
			save(store.get());
			return returned;
		};
	}
	if (mutate) {
		stored.mutate = function () {
			const returned = mutate.apply(this, arguments as any); // eslint-disable-line prefer-rest-params
			save((store as any).get().value);
			return returned;
		};
	}
	if (swap) {
		stored.swap = function () {
			const returned = swap.apply(this, arguments as any); // eslint-disable-line prefer-rest-params
			save((store as any).get().value);
			return returned;
		};
	}
	return stored;
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
