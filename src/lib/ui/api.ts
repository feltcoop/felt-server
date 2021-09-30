import {setContext, getContext} from 'svelte';
import {session} from '$app/stores';
import {writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {randomItem} from '@feltcoop/felt/util/random.js';

import type {Ui} from '$lib/ui/ui';
import type {Community, CommunityParams} from '$lib/vocab/community/community';
import type {Space, SpaceParams} from '$lib/vocab/space/space';
import type {Membership, MembershipParams} from '$lib/vocab/membership/membership';
import type {File, FileParams} from '$lib/vocab/file/file';
import type {LoginRequest} from '$lib/session/loginMiddleware.js';
import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiClient} from '$lib/ui/ApiClient';
import type {ApiResult} from '$lib/server/api';
import type {ServicesParamsMap, ServicesResultMap} from '$lib/server/servicesTypes';
import type {Persona, PersonaParams} from '$lib/vocab/persona/persona';

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
	(eventName: 'create_community', params: CommunityParams): Promise<ApiResult<Community>>;
	(eventName: string, params: any): null | Promise<ApiResult<any>>;
}

export interface Api {
	dispatch: Dispatch;
	logIn: (
		accountName: string,
		password: string,
	) => Promise<ApiResult<{session: ClientAccountSession}>>;
	logOut: () => Promise<ApiResult<{}>>;
	toggleMainNav: () => void;
	toggleSecondaryNav: () => void;
	createPersona: (
		params: PersonaParams,
	) => Promise<ApiResult<{persona: Persona; community: Community}>>;
	createSpace: (params: SpaceParams) => Promise<ApiResult<{space: Space}>>;
	createMembership: (params: MembershipParams) => Promise<ApiResult<{membership: Membership}>>;
	createFile: (params: FileParams) => Promise<ApiResult<{file: File}>>;
	loadFiles: (space_id: number) => Promise<ApiResult<{files: File[]}>>;
	getFilesBySpace: (space_id: number) => Readable<Readable<File>[]>;
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
			console.log('[api] invoking', eventName, params);
			ui.dispatch(eventName, params, null);
			const client = randomClient();
			return client.has(eventName)
				? client.invoke(eventName, params).then((result) => {
						console.log('[api] invoked', eventName, result);
						ui.dispatch(eventName, params, result);
						return result as ApiResult<any>;
				  })
				: null!;
		},
		// TODO these are just directly proxying and they don't have the normal `ApiResult` return value
		// The motivation is that sometimes UI events may do API-related things, but this may not be the best design.
		toggleMainNav: ui.toggleMainNav,
		toggleSecondaryNav: ui.toggleSecondaryNav,
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
		createPersona: async (params) => {
			if (!params.name) return {ok: false, status: 400, reason: 'invalid name'};
			const result = await randomClient().invoke('create_persona', params);
			console.log('[api] create_persona result', result);
			if (result.ok) {
				const {persona, community} = result.value;
				ui.addPersona(persona);
				// TODO rethink this
				ui.create_community({name: community.name, persona_id: persona.persona_id}, result);
			}
			return result as any; // TODO fix when Community type is fixed
		},
		// TODO: This implementation is currently unconsentful,
		// because does not give the potential member an opportunity to deny an invite
		createMembership: async (params) => {
			const result = await randomClient().invoke('create_membership', params);
			console.log('[api] create_membership result', result);
			if (result.ok) {
				ui.addMembership(result.value.membership);
			}
			return result;
		},
		createSpace: async (params) => {
			const result = await randomClient().invoke('create_space', params);
			console.log('[api] create_space result', result);
			if (result.ok) {
				ui.addSpace(result.value.space, params.community_id);
			}
			return result;
		},
		createFile: async (params) => {
			const result = await randomClient().invoke('create_file', params);
			console.log('create_file result', result);
			if (result.ok) {
				ui.addFile(result.value.file);
			}
			return result;
		},
		loadFiles: async (space_id) => {
			ui.setFiles(space_id, []);
			// TODO this breaks on startup because the websocket isn't connected yet
			const result = await randomClient().invoke('read_files', {space_id});
			console.log('[api] read_files result', result);
			if (result.ok) {
				ui.setFiles(space_id, result.value.files);
			}
			return result;
		},
		// TODO do we want to return the promise? maybe as `[value, resultPromise]`
		getFilesBySpace: (space_id) => {
			let files = ui.filesBySpace.get(space_id);
			if (!files) {
				ui.filesBySpace.set(space_id, (files = writable([])));
				api.loadFiles(space_id);
			}
			return files;
		},
	};
	return api;
};
