import {writable, type Readable, STORE_SUBSCRIBER_COUNT} from '$lib/store';

export interface Mutable<T> {
	subscribe: Readable<{value: T}>['subscribe'];
	get: Readable<{value: T}>['get'];
	[STORE_SUBSCRIBER_COUNT]: Readable<{value: T}>[typeof STORE_SUBSCRIBER_COUNT];
	mutate: (mutator?: (value: T) => void) => void;
	swap: (value: T) => void; // typical usage is mutating the value with `mutate`; this updates the ref
}

// TODO BLOCK prefer this one if it works

// export interface Mutable<T> extends Readable<{value: T}> {
// 	mutate: (mutator?: (value: T) => void) => void;
// 	swap: (value: T) => void; // typical usage is mutating the value with `mutate`; this updates the ref
// }

/**
 * Creates a store wrapping a mutable `value`.
 * Useful for values that are expensive to copy, like large `Map`s,
 * and values that cannot be cloned, like `WeakMap`s,
 * in combination with the Svelte `immutable` compiler flag.
 *
 * Typical usage mutates `value` inside the `mutator` callback, which has no return value.
 * Calling `mutate` with no callback triggers a change,
 * which is useful if `value` is mutated elsewhere,
 * but that's usually discouraged for readability reasons.
 *
 * To avoid unnecessary garbage creation,
 * the implementation swaps between two stable object references.
 * This breaks composability with code that
 * expects immutable references on every store change,
 * which may cause some surprising issues,
 * but given that the store value is mutated,
 * it's probably an issue only in rare cases.
 * If you don't need to mutate the store value, prefer a normal `writable` store.
 * The sibling module "safeMutable" version of this store
 * creates a new wrapper object on every change.
 *
 * @param value {any}
 */
export const mutable = <T>(value: T): Mutable<T> => {
	let swap = false;
	const a = {value};
	const b = {value};
	const store = writable(a);
	const {subscribe, get, set} = store;
	return {
		subscribe,
		get,
		[STORE_SUBSCRIBER_COUNT]: store[STORE_SUBSCRIBER_COUNT],
		mutate: (mutator) => {
			if (mutator) mutator(value);
			set((swap = !swap) ? b : a);
		},
		swap: (v) => {
			value = a.value = b.value = v; // eslint-disable-line no-param-reassign
			set((swap = !swap) ? b : a);
		},
	};
};
