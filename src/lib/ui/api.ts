import {setContext, getContext} from 'svelte';
import {session} from '$app/stores';

import type {DataStore} from '$lib/ui/data';
import type {UiStore} from '$lib/ui/ui';
import type {Community, CommunityParams} from '$lib/vocab/community/community';
import type {Space, SpaceParams} from '$lib/vocab/space/space';
import type {Membership, MembershipParams} from '$lib/vocab/membership/membership';
import type {File, FileParams} from '$lib/vocab/file/file';
import type {LoginRequest} from '$lib/session/loginMiddleware.js';
import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiClient, ApiResult} from '$lib/ui/ApiClient';
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

export interface Api {
	logIn: (
		accountName: string,
		password: string,
	) => Promise<ApiResult<{session: ClientAccountSession}>>;
	logOut: () => Promise<ApiResult<{}>>;
	selectPersona: (persona_id: number) => void;
	selectCommunity: (community_id: number | null) => void;
	selectSpace: (community_id: number, space: number | null) => void;
	toggleMainNav: () => void;
	toggleSecondaryNav: () => void;
	createPersona: (
		params: PersonaParams,
	) => Promise<ApiResult<{persona: Persona; community: Community}>>;
	createCommunity: (params: CommunityParams) => Promise<ApiResult<Community>>;
	createSpace: (params: SpaceParams) => Promise<ApiResult<{space: Space}>>;
	createMembership: (params: MembershipParams) => Promise<ApiResult<{membership: Membership}>>;
	createFile: (params: FileParams) => Promise<ApiResult<{file: File}>>;
	loadFiles: (space_id: number) => Promise<ApiResult<{files: File[]}>>;
}

export const toApi = (
	ui: UiStore,
	data: DataStore,
	client: ApiClient<ServicesParamsMap, ServicesResultMap>,
	client2: ApiClient<ServicesParamsMap, ServicesResultMap>, // TODO remove this after everything stabilizes
): Api => {
	const api: Api = {
		// TODO these are just directly proxying and they don't have the normal `ApiResult` return value
		// The motivation is that sometimes UI events may do API-related things, but this may not be the best design.
		selectPersona: ui.selectPersona,
		selectCommunity: ui.selectCommunity,
		selectSpace: ui.selectSpace,
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
			const result = await client2.invoke('create_persona', params);
			console.log('[api] create_community result', result);
			if (result.ok) {
				const {persona, community: rawCommunity} = result.value;
				const community = rawCommunity as Community; // TODO `Community` type is off with schema
				data.addCommunity(community, persona.persona_id);
				data.addPersona(persona);
				// TODO refactor to not return here, do `return result` below --
				// can't return `result` right now because the `Community` is different,
				// but we probably want to change it to have associated data instead of a different interface
				return {ok: true, status: result.status, value: {persona, community}};
			}
			return result;
		},
		createCommunity: async (params) => {
			if (!params.name) return {ok: false, status: 400, reason: 'invalid name'};
			const result = await client2.invoke('create_community', params);
			console.log('[api] create_community result', result);
			if (result.ok) {
				const community = result.value.community as any; // TODO `Community` type is off with schema
				data.addCommunity(community, params.persona_id);
				// TODO refactor to not return here, do `return result` below --
				// can't return `result` right now because the `Community` is different,
				// but we probably want to change it to have associated data instead of a different interface
				return {ok: true, status: result.status, value: community};
			}
			return result;
		},
		// TODO: This implementation is currently unconsentful,
		// because does not give the potential member an opportunity to deny an invite
		createMembership: async (params) => {
			const result = await client2.invoke('create_membership', params);
			console.log('[api] create_membership result', result);
			if (result.ok) {
				data.addMembership(result.value.membership);
			}
			return result;
		},
		createSpace: async (params) => {
			const result = await client2.invoke('create_space', params);
			console.log('[api] create_space result', result);
			if (result.ok) {
				data.addSpace(result.value.space, params.community_id);
			}
			return result;
		},
		createFile: async (params) => {
			const result = await client.invoke('create_file', params);
			console.log('create_file result', result);
			if (result.ok) {
				data.addFile(result.value.file);
			}
			return result;
		},
		loadFiles: async (space_id) => {
			data.setFiles(space_id, []);
			// TODO this breaks on startup because the websocket isn't connected yet
			const result = await client.invoke('read_files', {space_id});
			console.log('[api] read_files result', result);
			if (result.ok) {
				data.setFiles(space_id, result.value.files);
			}
			return result;
		},
	};
	return api;
};
