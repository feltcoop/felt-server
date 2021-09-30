import {setContext, getContext} from 'svelte';
import {randomItem} from '@feltcoop/felt/util/random.js';
import type {Static} from '@sinclair/typebox';
import type {Readable} from 'svelte/store';

import type {Ui} from '$lib/ui/ui';
import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiClient} from '$lib/ui/ApiClient';
import type {ApiResult} from '$lib/server/api';
import type {ServicesParamsMap, ServicesResultMap} from '$lib/server/servicesTypes';
import type {createCommunityService} from '$lib/vocab/community/communityServices';
import type {createPersonaService} from '$lib/vocab/persona/personaServices';
import type {createMembershipService} from '$lib/vocab/community/communityServices';
import type {createSpaceService} from '$lib/vocab/space/spaceServices';
import type {createFileService, readFilesService} from '$lib/vocab/file/fileServices';
import type {File} from '$lib/vocab/file/file';
import type {LoginRequest} from '$lib/session/loginMiddleware';

// TODO This was originally implemented as a Svelte store
// but we weren't using the state at all.
// It's now a plain object with functions.
// As our use cases develop, we may want to make it a store again,
// or perhaps a plain object is best for composition and extension.
// It may be best to have related state in optional external modules that
// observe the behavior of the api, to keep this module small and efficient.

const KEY = Symbol();

export const getApi = (): Api => getContext(KEY);

export const setApi = (store: Api): Api => {
	setContext(KEY, store);
	return store;
};

// TODO this name may be confusing because it's not used by the `dispatch` function types below
export interface DispatchContext<
	TParams extends any = object,
	TResult extends ApiResult<any> | void = void,
> {
	eventName: string;
	params: TParams;
	dispatch: Dispatch;
	client: ApiClient<ServicesParamsMap, ServicesResultMap>;
	invoke: TResult extends void ? null : (params?: TParams) => Promise<TResult>;
}

// TODO generate this interface from data
export interface Dispatch {
	// TODO convert log_in and log_out to services
	(eventName: 'log_in', params: LoginRequest): Promise<ApiResult<{session: ClientAccountSession}>>; // TODO
	(eventName: 'log_out', params?: undefined): Promise<ApiResult<void>>; // TODO type?
	(
		eventName: 'create_community',
		params: Static<typeof createCommunityService.paramsSchema>,
	): Promise<ApiResult<Static<typeof createCommunityService.responseSchema>>>;
	(eventName: 'create_persona', params: Static<typeof createPersonaService.paramsSchema>): Promise<
		ApiResult<Static<typeof createPersonaService.responseSchema>>
	>;
	(
		eventName: 'create_membership',
		params: Static<typeof createMembershipService.paramsSchema>,
	): Promise<ApiResult<Static<typeof createMembershipService.responseSchema>>>;
	(eventName: 'create_space', params: Static<typeof createSpaceService.paramsSchema>): Promise<
		ApiResult<Static<typeof createSpaceService.responseSchema>>
	>;
	(eventName: 'create_file', params: Static<typeof createFileService.paramsSchema>): Promise<
		ApiResult<Static<typeof createFileService.responseSchema>>
	>;
	(eventName: 'read_files', params: Static<typeof readFilesService.paramsSchema>): Promise<
		ApiResult<Static<typeof readFilesService.responseSchema>>
	>;
	// TODO This query is different than the rest -- does it make sense to use the same dispatch system?
	// As currently implemented, `query_files` is not a registered service,
	// so `dispatch` will return whatever synchronous result is returned by the `ui` handler.
	(eventName: 'query_files', params: Static<typeof readFilesService.paramsSchema>): Readable<
		Readable<File>[]
	>;
	(eventName: 'toggle_main_nav', params?: any): void;
	(eventName: 'toggle_secondary_nav', params?: any): void;
	// TODO declare this with function overloading instead of this interface
	// fallback to any
	// (eventName: string, params?: any): void | Promise<ApiResult<any>>;
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
		// TODO could validate the params here, but for now we'll just let the server validate2
		dispatch: (eventName, params) => {
			console.log('[api] invoking', eventName, params ?? '');
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
