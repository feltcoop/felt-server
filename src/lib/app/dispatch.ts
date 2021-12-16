import {setContext, getContext} from 'svelte';

import type {Ui} from '$lib/ui/ui';
import type {ApiClient} from '$lib/ui/ApiClient';
import type {ApiResult} from '$lib/server/api';
import type {EventParamsByName, EventResponseByName} from '$lib/app/eventTypes';
import type {Dispatch} from '$lib/app/eventTypes';

// TODO this has evolved to the point where perhaps this module should be `dispatch.ts`
// and removing the `Api` namespace wrapper.
// One reason we wouldn't do this is if we wanted to bundle other data/functions
// inside the same closure as `dispatch`.

const KEY = Symbol();

export const getDispatch = (): Dispatch => getContext(KEY);

export const setDispatch = (store: Dispatch): Dispatch => {
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
	client: ApiClient<EventParamsByName, EventResponseByName>;
	invoke: TResult extends void ? null : (params?: TParams) => Promise<TResult>;
}

export const toDispatch = (
	ui: Ui,
	client: ApiClient<EventParamsByName, EventResponseByName>,
): Dispatch => {
	// TODO validate the params here to improve UX, but for now we're safe letting the server validate
	const dispatch: Dispatch = (eventName, params) => {
		console.log(
			'%c[dispatch.%c' + eventName + '%c]',
			'color: gray',
			'color: blue',
			'color: gray',
			params === undefined ? '' : params, // print null but not undefined
		);
		const ctx: DispatchContext = {
			eventName,
			params,
			dispatch,
			client,
			invoke: client.has(eventName) ? (p = params) => client.invoke(eventName, p) : (null as any), // TODO fix typecast?
		};
		return ui.dispatch(ctx);
	};
	return dispatch;
};
