import {browser} from '$app/env';
import type {Json} from '@feltcoop/felt/util/json.js';
// import {Logger} from '@feltcoop/felt/util/log.js';

// const log = new Logger('[storage]');

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
	const stored = localStorage.getItem(key);
	if (!stored) {
		// log.trace('loaded nothing', key);
		return;
	}
	try {
		const parsed = JSON.parse(stored);
		validate?.(parsed);
		// log.trace('loaded', key, parsed);
		return parsed;
	} catch (err) {
		localStorage.removeItem(key);
		return;
	}
};

/**
 * Sets `value` at `key`.
 * If `value` is `undefined` the `key` is removed,
 * but a `value` of `null` is stored.
 * @param key
 * @param value
 */
export const setInStorage = (key: string, value: Json): void => {
	if (!browser) return;
	if (value === undefined) {
		// log.trace('removing', key);
		localStorage.removeItem(key);
	} else {
		// log.trace('setting', key, value);
		localStorage.setItem(key, JSON.stringify(value));
	}
};
