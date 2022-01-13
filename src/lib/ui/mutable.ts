import {writable, type Readable} from 'svelte/store';

export interface Mutable<T> {
	subscribe: Readable<{value: T}>['subscribe'];
	update(updater?: MutableUpdater<T>): void;
}

// Returning `T` updates the `value` reference,
// but typical usage is to mutate `value` in the `MutableUpdater` and return nothing.
export interface MutableUpdater<T> {
	(value: T): void | T;
}

/**
 * Creates a store wrapping a mutable `value`.
 * Useful for values that are expensive to copy, like large `Map`s,
 * in combination with the Svelte `immutable` compiler flag.
 *
 * Typical usage mutates `value` inside the `updater` callback and returns nothing,
 * but the `updater` can return a new reference for `value`.
 * Returning `undefined` from `updater` keeps the existing `value` reference,
 * and therefore `undefined` is not a valid `value`,
 * so prefer `null` over `undefined` to represent empty values.
 * Calling `update` with no callback triggers a change,
 * which is useful if `value` is mutated elsewhere, but that's usually discouraged.
 *
 * To avoid unnecessary garbage creation,
 * the implementation swaps between two stable object references.
 * This may hinder composability with code that
 * expects immutable references on every store change,
 * but given that this store is named `mutable`,
 * it seems acceptable to push this concern downstream for better efficiency in the typical case.
 * An immutable stream of values can be derived quite easily for those cases that need it:
 * const someImmutableValue = derived(mutable({}), ($v) => ({value: $v.value}));
 *
 * @param value
 */
export const mutable = <T>(value: T): Mutable<T> => {
	let swap = false;
	const a = {value};
	const b = {value};

	const {subscribe, set} = writable<{value: T}>(a);

	return {
		subscribe,
		update: (updater) => {
			if (updater) {
				const updated = updater(value);
				if (updated !== undefined && updated !== value) {
					value = a.value = b.value = updated;
				}
			}
			set((swap = !swap) ? b : a);
		},
	};
};
