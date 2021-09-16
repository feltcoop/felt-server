import {writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
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

const KEY = Symbol();

export const getApi = (): ApiStore => getContext(KEY);

export const setApi = (store: ApiStore): ApiStore => {
	setContext(KEY, store);
	return store;
};

export interface ApiState {}

// TODO probably remove these object wrappers from `value`
export interface ApiStore {
	subscribe: Readable<ApiState>['subscribe'];
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

export const toApiStore = (
	ui: UiStore,
	data: DataStore,
	client: ApiClient<ServicesParamsMap, ServicesResultMap>,
	client2: ApiClient<ServicesParamsMap, ServicesResultMap>, // TODO remove this after testing
): ApiStore => {
	// TODO set the `api` state with progress of remote calls
	const {subscribe} = writable<ApiState>(toDefaultApiState());

	// let $ui: UiState;
	// let $data: DataState;
	// ui.subscribe(($u) => ($ui = $u));
	// data.subscribe(($d) => ($data = $d));

	const store: ApiStore = {
		subscribe,
		// TODO these are just directly proxying
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
					return {ok: true, value: responseData}; // TODO doesn't this have other status codes?
				} else {
					console.error('[logIn] response not ok', responseData, response); // TODO logging
					return {ok: false, reason: responseData.reason};
				}
			} catch (err) {
				console.error('[logIn] error', err); // TODO logging
				return {
					ok: false,
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
					return {ok: true, value: responseData};
				} else {
					console.error('[logOut] response not ok', response); // TODO logging
					return {ok: false, reason: responseData.reason};
				}
			} catch (err) {
				console.error('[logOut] err', err); // TODO logging
				return {
					ok: false,
					reason: `Something went wrong. Is your Internet connection working? Maybe the server is busted. Please try again!`,
				};
			}
		},
		createCommunity: async (params) => {
			if (!params.name) return {ok: false, reason: 'invalid name'};
			const result = await client2.invoke('create_community', params);
			console.log('[api] create_community result', result);
			if (!result.ok) return result;
			const community = toCommunityModel(result.value.community as any); // TODO `Community` type is off with schema
			data.addCommunity(community, params.persona_id);
			// TODO can't return `result` because the `CommunityModel` is different,
			// but we probably want to change it to have associated data instead of a different interface
			return {ok: true, value: community};
		},
		createSpace: async (params) => {
			const result = await client2.invoke('create_space', params);
			console.log('[api] create_space result', result);
			if (!result.ok) return result;
			data.addSpace(result.value.space, params.community_id);
			return result;
		},
		// TODO: This implementation is currently unconsentful,
		// because does not give the potential member an opportunity to deny an invite
		inviteMember: async (community_id, persona_id) => {
			// TODO proper automated validation
			if (community_id == null) return {ok: false, reason: 'invalid url'};
			if (!persona_id) return {ok: false, reason: 'invalid persona'};

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
					return {ok: true, value: result};
				} catch (err) {
					return {ok: false, reason: err.message};
				}
			} else {
				throw Error(`error: ${res.status}: ${res.statusText}`);
			}
		},
		createFile: async (params: FileParams) => {
			const result = await client.invoke('create_file', params);
			console.log('create_file result', result);
			if (!result.ok) return result;
			data.addFile(result.value.file);
			return result;
		},
		loadFiles: async (space_id) => {
			data.setFiles(space_id, []);
			// TODO this isn't working with the websocket client
			const result = await client2.invoke('read_files', {space_id});
			console.log('[api] read_files result', result);
			if (!result.ok) return result;
			data.setFiles(space_id, result.value.files);
			return result;
		},
	};
	return store;
};

const toDefaultApiState = (): ApiState => ({
	selectedCommunityId: null,
	selectedSpaceIdByCommunity: {},
});
