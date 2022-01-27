import {setContext, getContext} from 'svelte';

import type {Ui} from '$lib/ui/ui';
import type {ApiClient} from '$lib/ui/ApiClient';
import type {ApiResult} from '$lib/server/api';
import type {EventParamsByName, EventResponseByName} from '$lib/app/eventTypes';
import type {Dispatch} from '$lib/app/eventTypes';

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

export const toDispatch = (ui: Ui, clients: ApiClient[]): Dispatch => {
	// TODO validate the params here to improve UX, but for now we're safe letting the server validate
	const dispatch: Dispatch = (eventName, params) => {
		console.log(
			'%c[dispatch.%c' + eventName + '%c]',
			'color: gray',
			'color: blue',
			'color: gray',
			params === undefined ? '' : params, // print null but not undefined
		);
		// TODO Falling back to the first client may be a bad idea,
		// because events may want arbitrary access to any of the clients.
		// Maybe `clients` should be an object that we pass through, `{http, ws}` ? (types?)
		// Then `client` could be `null` when the service has data that says it uses no clients.
		const client = clients.find((c) => c.has(eventName)) || clients[0];
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
