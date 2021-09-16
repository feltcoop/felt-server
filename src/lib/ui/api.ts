import {setContext, getContext} from 'svelte';
import {session} from '$app/stores';

import type {DataStore} from '$lib/ui/data';
import type {UiStore} from '$lib/ui/ui';
import type {CommunityModel, CommunityParams} from '$lib/vocab/community/community';
import {toCommunityModel} from '$lib/vocab/community/community';
import type {Space, SpaceParams} from '$lib/vocab/space/space';
import type {Member, MemberParams} from '$lib/vocab/member/member';
import type {File, FileParams} from '$lib/vocab/file/file';
import type {LoginRequest} from '$lib/session/loginMiddleware.js';
import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ApiClient, ApiResult} from '$lib/ui/ApiClient';
import type {ServicesParamsMap, ServicesResultMap} from '$lib/server/servicesTypes';

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
	createCommunity: (params: CommunityParams) => Promise<ApiResult<CommunityModel>>;
	createSpace: (params: SpaceParams) => Promise<ApiResult<{space: Space}>>;
	inviteMember: (
		community_id: number, // TODO using `Community` instead of `community_id` breaks the pattern above
		persona_id: number,
	) => Promise<ApiResult<{member: Member}>>;
	createFile: (params: FileParams) => Promise<ApiResult<{file: File}>>;
	loadFiles: (space_id: number) => Promise<ApiResult<{files: File[]}>>;
}

export const toApi = (
	ui: UiStore,
	data: DataStore,
	client: ApiClient<ServicesParamsMap, ServicesResultMap>,
	client2: ApiClient<ServicesParamsMap, ServicesResultMap>, // TODO remove this after testing
): Api => {
	const api: Api = {
		// TODO these are just directly proxying and they don't have the normal `ApiResult` return value
		// The motivation is that sometimes UI events may do API-related things, but this may not be the best design.
		selectPersona: ui.selectPersona,
		selectCommunity: ui.selectCommunity,
		selectSpace: ui.selectSpace,
		toggleMainNav: ui.toggleMainNav,
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
					return {ok: true, status: response.status, data: responseData}; // TODO doesn't this have other status codes?
				} else {
					console.error('[logIn] response not ok', responseData, response); // TODO logging
					return {ok: false, status: response.status, reason: responseData.reason};
				}
			} catch (err) {
				console.error('[logIn] error', err); // TODO logging
				return {
					ok: false,
					status: 500, // TODO what's the correct status?
					reason: `Something went wrong. Is your Internet connection working? Maybe the server is busted. Please try again.`,
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
					return {ok: true, status: response.status, data: responseData};
				} else {
					console.error('[logOut] response not ok', response); // TODO logging
					return {ok: false, status: response.status, reason: responseData.reason};
				}
			} catch (err) {
				console.error('[logOut] err', err); // TODO logging
				return {
					ok: false,
					status: 500, // TODO what's the correct status?
					reason: `Something went wrong. Is your Internet connection working? Maybe the server is busted. Please try again!`,
				};
			}
		},
		createCommunity: async (params) => {
			if (!params.name) return {ok: false, status: 400, reason: 'invalid name'};
			const result = await client2.invoke('create_community', params);
			console.log('[api] create_community result', result);
			if (result.ok) {
				const community = toCommunityModel(result.data.community as any); // TODO `Community` type is off with schema
				data.addCommunity(community, params.persona_id);
				// TODO refactor to not return here, do `return result` below --
				// can't return `result` right now because the `CommunityModel` is different,
				// but we probably want to change it to have associated data instead of a different interface
				return {ok: true, status: result.status, data: community};
			}
			return result;
		},
		createSpace: async (params) => {
			const result = await client2.invoke('create_space', params);
			console.log('[api] create_space result', result);
			if (result.ok) {
				data.addSpace(result.data.space, params.community_id);
			}
			return result;
		},
		// TODO refactor this after `membership` stuff is merged
		// TODO: This implementation is currently unconsentful,
		// because does not give the potential member an opportunity to deny an invite
		inviteMember: async (community_id, persona_id) => {
			// TODO proper automated validation
			if (community_id == null) return {ok: false, status: 400, reason: 'invalid url'};
			if (!persona_id) return {ok: false, status: 400, reason: 'invalid persona'};

			const doc: MemberParams = {
				persona_id,
				community_id,
			};

			// TODO change this input, consider `/api/v1/invitations`
			const res = await fetch(`/api/v1/members`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(doc),
			});
			if (res.ok) {
				try {
					const result: {member: Member} = await res.json(); // TODO api types
					console.log('inviteMember result', result);
					data.addMember(result.member);
					return {ok: true, status: 200, data: result};
				} catch (err) {
					return {ok: false, status: 400, reason: err.message};
				}
			} else {
				throw Error(`error: ${res.status}: ${res.statusText}`);
			}
		},
		createFile: async (params) => {
			const result = await client.invoke('create_file', params);
			console.log('create_file result', result);
			if (result.ok) {
				data.addFile(result.data.file);
			}
			return result;
		},
		loadFiles: async (space_id) => {
			data.setFiles(space_id, []);
			// TODO this breaks on startup because the websocket isn't connected yet
			const result = await client.invoke('read_files', {space_id});
			console.log('[api] read_files result', result);
			if (result.ok) {
				data.setFiles(space_id, result.data.files);
			}
			return result;
		},
	};
	return api;
};
