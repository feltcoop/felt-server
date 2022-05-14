import {writable, STORE_SUBSCRIBER_COUNT} from '$lib/store';
import type {Mutable} from '$lib/store2';

/**
 * Creates a store wrapping a mutable `value`.
 * See the sibling `mutable` store for more docs.
 *
 * Unlike `mutable`, this implementation creates a new object wrapper value on every change.
 * This composes with code that expects immutable references on every store change,
 * but creates a bit of garbage that's sometimes avoidable,
 * and the cases where it's useful are probably pretty rare,
 * because the library's purpose is to mutate the store values,
 * which doesn't compose immutably either.
 * If you don't need to mutate the store value, prefer a normal `writable` store.
 *
 * @param value {any}
 */
export const safeMutable = <T>(value: T): Mutable<T> => {
	const store = writable({value});
	const {subscribe, get, set} = store;
	return {
		subscribe,
		get,
		[STORE_SUBSCRIBER_COUNT]: store[STORE_SUBSCRIBER_COUNT],
		mutate: (mutator) => {
			if (mutator) mutator(value);
			set({value});
		},
		swap: (v) => {
			value = v; // eslint-disable-line no-param-reassign
			set({value});
		},
	};
};
