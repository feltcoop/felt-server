import {setContext, getContext} from 'svelte';
import {session} from '$app/stores';
import {randomItem} from '@feltcoop/felt/util/random.js';
import type {Static} from '@sinclair/typebox';
import type {Readable} from 'svelte/store';

import type {Ui} from '$lib/ui/ui';
import type {LoginRequest} from '$lib/session/loginMiddleware.js';
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

// TODO This was originally implemented as a Svelte store
// but we weren't using the state at all.
// It's now a plain object with functions.
// As our use cases develop, we may want to make it a store again,
// or perhaps a plain object is best for composition and extension.
// It may be best to have related state in optional external modules that
// observe the behavior of the api, to keep this module small and efficient.

const UNKNOWN_API_ERROR =
	'Something went wrong. Maybe the server or your Internet connection is down. Please try again.';

const KEY = Symbol();

export const getApi = (): Api => getContext(KEY);

export const setApi = (store: Api): Api => {
	setContext(KEY, store);
	return store;
};

export interface Dispatch {
	// TODO generate these
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
	logIn: (
		accountName: string,
		password: string,
	) => Promise<ApiResult<{session: ClientAccountSession}>>;
	logOut: () => Promise<ApiResult<{}>>;
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
			const returnedSync = ui.dispatch(eventName, params, null, api.dispatch);
			const client = randomClient();
			if (client.has(eventName)) {
				return client.invoke(eventName, params).then((result) => {
					console.log('[api] invoked', eventName, result);
					const returnedAsync = ui.dispatch(eventName, params, result, api.dispatch);
					// TODO looks like this check fails to return `result` if `ui.dispatch` returns an async function,
					// should we just make downstream callers return the result if they want it forwarded?
					return returnedAsync !== undefined ? returnedAsync : result;
				});
			}
			return returnedSync as any;
		},
		logIn: async (accountName, password) => {
			console.log('[logIn] logging in with accountName', accountName); // TODO logging
			try {
				const loginRequest: LoginRequest = {accountName, password};
				const response = await fetch('/api/v1/login', {
					method: 'POST',
					headers: {'content-type': 'application/json'},
					body: JSON.stringify(loginRequest),
				});
				const responseData = await response.json();
				if (response.ok) {
					console.log('[logIn] responseData', responseData); // TODO logging
					accountName = '';
					session.set(responseData.session);
					return {ok: true, status: response.status, value: responseData}; // TODO doesn't this have other status codes?
				} else {
					console.error('[logIn] response not ok', responseData, response); // TODO logging
					return {ok: false, status: response.status, reason: responseData.reason};
				}
			} catch (err) {
				console.error('[logIn] error', err); // TODO logging
				return {
					ok: false,
					status: 500,
					reason: UNKNOWN_API_ERROR,
				};
			}
		},
		logOut: async () => {
			try {
				console.log('[logOut] logging out'); // TODO logging
				const response = await fetch('/api/v1/logout', {
					method: 'POST',
					headers: {'content-type': 'application/json'},
				});
				const responseData = await response.json();
				console.log('[logOut] response', responseData); // TODO logging
				if (response.ok) {
					session.set({guest: true});
					return {ok: true, status: response.status, value: responseData};
				} else {
					console.error('[logOut] response not ok', response); // TODO logging
					return {ok: false, status: response.status, reason: responseData.reason};
				}
			} catch (err) {
				console.error('[logOut] err', err); // TODO logging
				return {
					ok: false,
					status: 500,
					reason: UNKNOWN_API_ERROR,
				};
			}
		},
	};
	return api;
};
