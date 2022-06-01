import {setContext, getContext} from 'svelte';
import type {Writable as SvelteWritable} from 'svelte/store';

import type {Ui} from '$lib/ui/ui';
import type {Dispatch} from '$lib/app/eventTypes';
import type {SocketStore} from '$lib/ui/socket';

// TODO refactor/rethink

export interface AppStores {
	dispatch: Dispatch;
	ui: Ui;
	socket: SocketStore;
	devmode: SvelteWritable<boolean>;
}

export const LAST_SEEN_KEY = 'lastseen:';

const KEY = Symbol();

export const getApp = (): AppStores => getContext(KEY);

export const setApp = (stores: AppStores): AppStores => {
	setContext(KEY, stores);
	return stores;
};
