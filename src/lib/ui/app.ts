import {setContext, getContext} from 'svelte';
import type {Writable} from 'svelte/store';

import type {Ui} from '$lib/ui/ui';
import type {Api} from '$lib/ui/api';
import type {SocketStore} from '$lib/ui/socket';
import type {ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';

// TODO refactor/rethink

export interface AppStores {
	api: Api;
	ui: Ui;
	socket: SocketStore;
	devmode: Writable<boolean>;
	contextmenu: ContextmenuStore;
}

const KEY = Symbol();

export const getApp = (): AppStores => getContext(KEY);

export const setApp = (stores: AppStores): AppStores => {
	setContext(KEY, stores);
	return stores;
};
