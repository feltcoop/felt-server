import {setContext, getContext} from 'svelte';
import type {Writable} from 'svelte/store';

import type {Data_Store} from '$lib/ui/data';
import type {Ui_Store} from '$lib/ui/ui';
import type {Api_Store} from '$lib/ui/api';
import type {Socket_Store} from '$lib/ui/socket';

// TODO refactor/rethink

export interface App_Stores {
	api: Api_Store;
	data: Data_Store;
	ui: Ui_Store;
	socket: Socket_Store;
	devmode: Writable<boolean>;
}

const KEY = Symbol();

export const get_app = (): App_Stores => getContext(KEY);

export const set_app = (stores: App_Stores): App_Stores => {
	setContext(KEY, stores);
	return stores;
};
