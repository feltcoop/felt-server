import {setContext, getContext} from 'svelte';

import type {Ui} from '$lib/ui/ui';
import type {ApiClient} from '$lib/ui/ApiClient';
import type {ApiResult} from '$lib/server/api';
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
	invoke: TResult extends void ? null : (params?: TParams) => Promise<TResult>;
}

export interface ToDispatchClient {
	(eventName: string): ApiClient | null;
}

export const toDispatch = (ui: Ui, toClient: ToDispatchClient): Dispatch => {
	// TODO validate the params here to improve UX, but for now we're safe letting the server validate
	const dispatch: Dispatch = (eventName, params) => {
		console.log(
			'%c[dispatch.%c' + eventName + '%c]',
			'color: gray',
			'color: blue',
			'color: gray',
			params === undefined ? '' : params, // print null but not undefined
		);
		const client = toClient(eventName);
		const ctx: DispatchContext = {
			eventName,
			params,
			dispatch,
			invoke: client ? (p = params) => client.invoke(eventName, p) : (null as any), // TODO fix typecast?
		};
		return ui.dispatch(ctx);
	};
	return dispatch;
};
