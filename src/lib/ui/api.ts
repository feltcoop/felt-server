import {writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';
import {session} from '$app/stores';
import type {Result} from '@feltcoop/felt';

import type {DataStore} from '$lib/ui/data';
import type {UiStore} from '$lib/ui/ui';
import type {Community, CommunityModel, CommunityParams} from '$lib/vocab/community/community';
import {toCommunityModel} from '$lib/vocab/community/community';
import type {Space, SpaceParams} from '$lib/vocab/space/space';
import type {Membership, MembershipParams} from '$lib/vocab/membership/membership';
import type {File, FileParams} from '$lib/vocab/file/file';
import type {SocketStore} from '$lib/ui/socket';
import type {LoginRequest} from '$lib/session/loginMiddleware.js';
import type {ClientAccountSession} from '$lib/session/clientSession';
import type {ErrorResponse} from '$lib/util/error';
import type {Persona, PersonaParams} from '$lib/vocab/persona/persona';

// TODO refactor/rethink

const KEY = Symbol();

export const getApi = (): ApiStore => getContext(KEY);

export const setApi = (store: ApiStore): ApiStore => {
	setContext(KEY, store);
	return store;
};

export interface ApiState {}

export type ApiResult<TValue> = Result<TValue, ErrorResponse>;

export interface ApiStore {
	subscribe: Readable<ApiState>['subscribe'];
	logIn: (
		accountName: string,
		password: string,
	) => Promise<ApiResult<{value: {session: ClientAccountSession}}>>;
	logOut: () => Promise<ApiResult<{}>>;
	selectPersona: (persona_id: number) => void;
	selectCommunity: (community_id: number | null) => void;
	selectSpace: (community_id: number, space: number | null) => void;
	toggleMainNav: () => void;
	createPersona: (
		params: PersonaParams,
	) => Promise<ApiResult<{value: {persona: Persona; community: Community}}>>;
	createCommunity: (
		name: string,
		persona_id: number,
	) => Promise<ApiResult<{value: {community: CommunityModel}}>>;
	createSpace: (params: SpaceParams) => Promise<ApiResult<{value: {space: Space}}>>;
	inviteMember: (
		community_id: number,
		persona_id: number,
	) => Promise<ApiResult<{value: {membership: Membership}}>>;
	createFile: (params: FileParams) => Promise<ApiResult<{value: {file: File}}>>;
	loadFiles: (space_id: number) => Promise<ApiResult<{value: {file: File[]}}>>;
}

export const toApiStore = (ui: UiStore, data: DataStore, socket: SocketStore): ApiStore => {
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
					return {ok: true, value: responseData};
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
					return {ok: true};
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
		createPersona: async (params) => {
			const res = await fetch(`/api/v1/personas`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(params),
			});
			if (res.ok) {
				try {
					const result: {persona: Persona; community: Community} = await res.json(); // TODO api types
					console.log('createPersona result', result);
					const {persona, community: rawCommunity} = result;
					const community = toCommunityModel(rawCommunity);
					data.addCommunity(community, persona.persona_id);
					data.addPersona(persona);
					return {ok: true, value: {persona, community}};
				} catch (err) {
					return {ok: false, reason: err.message};
				}
			} else {
				throw Error(`error: ${res.status}: ${res.statusText}`);
			}
		},
		createCommunity: async (name, persona_id) => {
			if (!name) return {ok: false, reason: 'invalid name'};
			//Needs to collect name
			const communityParams: CommunityParams = {
				name,
				persona_id,
			};
			const res = await fetch(`/api/v1/communities`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(communityParams),
			});
			if (res.ok) {
				try {
					const result: {community: Community} = await res.json(); // TODO api types
					console.log('createCommunity result', result);
					const community = toCommunityModel(result.community);
					data.addCommunity(community, persona_id);
					return {ok: true, value: {community}};
				} catch (err) {
					return {ok: false, reason: err.message};
				}
			} else {
				throw Error(`error: ${res.status}: ${res.statusText}`);
			}
		},
		createSpace: async (params) => {
			try {
				const res = await fetch(`/api/v1/communities/${params.community_id}/spaces`, {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify(params),
				});
				if (res.ok) {
					const result: {space: Space} = await res.json(); // TODO api types
					console.log('[createSpace] result', result);
					data.addSpace(result.space, params.community_id);
					return {ok: true, value: result};
				} else {
					const json = await res.json();
					throw Error(`[createSpace.failed] ${json.reason}`);
				}
			} catch (err) {
				console.error(err.message);
				return {ok: false, reason: err.message};
			}
		},
		// TODO: This implementation is currently unconsentful,
		// because does not give the potential member an opportunity to deny an invite
		inviteMember: async (
			community_id,
			persona_id, // TODO `persona_id`
		) => {
			// TODO proper automated validation
			if (community_id == null) return {ok: false, reason: 'invalid url'};
			if (!persona_id) return {ok: false, reason: 'invalid persona'};

			const doc: MembershipParams = {
				persona_id,
				community_id,
			};

			// TODO change this input, consider `/api/v1/invitations`
			const res = await fetch(`/api/v1/memberships`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(doc),
			});
			if (res.ok) {
				try {
					const result: {membership: Membership} = await res.json(); // TODO api types
					console.log('inviteMember result', result);
					return {ok: true, value: result};
				} catch (err) {
					return {ok: false, reason: err.message};
				}
			} else {
				throw Error(`error: ${res.status}: ${res.statusText}`);
			}
		},
		createFile: async (params: FileParams) => {
			// TODO type
			const message: {type: 'create_file'; params: FileParams} = {
				type: 'create_file',
				params,
			};
			socket.send(message);
			return {
				ok: true,
				get value() {
					// TODO change API to be fire-and-forget? or return this value somehow?
					throw Error('TODO currently incompatible with value');
				},
			} as any;
			// TODO below is the REST API version -- need to extract separate clients
			/*
			const res = await fetch(`/api/v1/spaces/${space.space_id}/files`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					content,
					actor_id: persona_id,
				}),
			});
			if (res.ok) {
				try {
					console.log('file sent, broadcasting to server');
					const json = await res.json();
					socket.send(json); // TODO refactor
					return {ok: true, value: json};
				} catch (err) {
					return {ok: false, reason: err.message};
				}
			} else {
				throw Error(`error sending file: ${res.status}: ${res.statusText}`);
			}
			*/
		},
		loadFiles: async (space_id) => {
			data.setFiles(space_id, []);
			const res = await fetch(`/api/v1/spaces/${space_id}/files`);
			if (res.ok) {
				try {
					const json = await res.json();
					data.setFiles(space_id, json.files);
					return {ok: true, value: json};
				} catch (err) {
					console.error('err', err);
					return {ok: false, reason: err.message};
				}
			} else {
				let reason: string;
				try {
					const json = await res.json();
					reason = json.reason;
				} catch (err) {
					reason = `error loading files: ${res.status}: ${res.statusText}`;
				}
				console.error('failed to load files:', reason);
				return {ok: false, reason};
			}
		},
	};
	return store;
};

const toDefaultApiState = (): ApiState => ({
	selectedCommunityId: null,
	selectedSpaceIdByCommunity: {},
});
