import {setContext, getContext} from 'svelte';
import {randomItem} from '@feltcoop/felt/util/random.js';

import type {Ui} from '$lib/ui/ui';
import type {ApiClient} from '$lib/ui/ApiClient';
import type {ApiResult} from '$lib/server/api';
import type {ServicesParamsMap, ServicesResultMap} from '$lib/server/servicesTypes';
import type {Dispatch} from '$lib/ui/events';

// TODO this has evolved to the point where perhaps this module should be `dispatch.ts`
// and removing the `Api` namespace wrapper.
// One reason we wouldn't do this is if we wanted to bundle other data/functions
// inside the same closure as `dispatch`.

const KEY = Symbol();

export const getApi = (): Api => getContext(KEY);

export const setApi = (store: Api): Api => {
	setContext(KEY, store);
	return store;
};

export interface DispatchContext<
	TParams extends unknown = unknown, // TODO can be any json, but type currently doesn't work with our events
	TResult extends ApiResult<unknown> | void = void,
> {
	eventName: string;
	params: TParams;
	dispatch: Dispatch;
	client: ApiClient<ServicesParamsMap, ServicesResultMap>;
	invoke: TResult extends void ? null : (params?: TParams) => Promise<TResult>;
}

export interface Api {
	dispatch: Dispatch;
}

export const toApi = (
	ui: Ui,
	client: ApiClient<ServicesParamsMap, ServicesResultMap>,
	client2: ApiClient<ServicesParamsMap, ServicesResultMap>, // TODO remove this after everything stabilizes
): Api => {
	// TODO delete this and `client2` after adding tests for both the websocket and http clients
	const clients = [client, client2];
	const randomClient = () => randomItem(clients);
	const api: Api = {
		// TODO validate the params here to improve UX, but for now we're safe letting the server validate
		dispatch: (eventName, params) => {
			console.log(
				'%c[dispatch.%c' + eventName + '%c]',
				'color: gray',
				'color: blue',
				'color: gray',
				params === undefined ? '' : params, // print null but not undefined
			);
			const client = randomClient();
			const ctx: DispatchContext = {
				eventName,
				params,
				dispatch: api.dispatch,
				client,
				invoke: client.has(eventName) ? (p = params) => client.invoke(eventName, p) : (null as any), // TODO fix typecast?
			};
			return ui.dispatch(ctx);
		},
	};
	return api;
};
