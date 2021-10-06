import {setContext, getContext} from 'svelte';
import type {Writable} from 'svelte/store';

import type {Ui} from '$lib/ui/ui';
import type {Api} from '$lib/ui/api';
import type {SocketStore} from '$lib/ui/socket';

// TODO refactor/rethink

export interface AppStores {
	api: Api;
	ui: Ui;
	socket: SocketStore;
	devmode: Writable<boolean>;
}

const KEY = Symbol();

export const getApp = (): AppStores => getContext(KEY);

export const setApp = (stores: AppStores): AppStores => {
	setContext(KEY, stores);
	return stores;
};
