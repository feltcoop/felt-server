import {setContext, getContext} from 'svelte';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {WritableUi} from '$lib/ui/ui';
import type {ApiClient} from '$lib/ui/ApiClient';
import type {ApiResult} from '$lib/server/api';
import type {Dispatch} from '$lib/app/eventTypes';
import type {BroadcastMessage} from '$lib/server/websocketMiddleware';
import type {Mutation} from '$lib/ui/mutation';

const log = new Logger();

const KEY = Symbol();

export const getDispatch = (): Dispatch => getContext(KEY);

export const setDispatch = (store: Dispatch): Dispatch => {
	setContext(KEY, store);
	return store;
};

export interface DispatchContext<
	TParams = unknown,
	TResult extends ApiResult<unknown> | void = any,
> {
	eventName: string;
	params: TParams;
	dispatch: Dispatch;
	ui: WritableUi;
	invoke: TResult extends void ? null : (params?: TParams) => Promise<TResult>;
}

export interface ToDispatchClient {
	(eventName: string): ApiClient | null;
}

export const toDispatch = (
	ui: WritableUi,
	mutations: Record<string, Mutation>,
	toClient: ToDispatchClient,
): Dispatch => {
	// TODO validate the params here to improve UX, but for now we're safe letting the server validate
	const dispatch: Dispatch = new Proxy({} as any, {
		get: (_target, eventName: string) => (params: unknown) => {
			log.trace(
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
				ui,
				dispatch,
				invoke: client ? (p = params) => client.invoke(eventName, p) : null,
			};
			const mutation = mutations[eventName];
			if (!mutation) {
				log.warn(`ignoring event with no mutation: ${eventName}`, ctx);
				return;
			}
			return mutation(ctx);
		},
	});
	return dispatch;
};

export interface DispatchBroadcastMessage {
	(message: BroadcastMessage): any;
}

export const toDispatchBroadcastMessage =
	(
		ui: WritableUi,
		mutations: Record<string, Mutation>,
		dispatch: Dispatch,
	): DispatchBroadcastMessage =>
	(message) => {
		const {method: eventName, params} = message;
		log.trace(
			'%c[broadcast.%c' + eventName + '%c]',
			'color: gray',
			'color: darkCyan',
			'color: gray',
			params === undefined ? '' : params, // print null but not undefined
		);
		const ctx: DispatchContext = {
			eventName,
			params,
			ui,
			dispatch,
			invoke: () => Promise.resolve(message.result),
		};
		const mutation = mutations[eventName];
		if (!mutation) {
			log.warn(`ignoring broadcast event with no mutation: ${eventName}`, ctx);
			return;
		}
		return mutation(ctx);
	};
