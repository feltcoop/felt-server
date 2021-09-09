import {writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';
import {session} from '$app/stores';
import type {Result} from '@feltcoop/felt';

import type {DataStore} from '$lib/ui/data';
import type {UiStore} from '$lib/ui/ui';
import type {Community, CommunityModel, CommunityParams} from '$lib/vocab/community/community';
import {to_community_model} from '$lib/vocab/community/community';
import type {Space, SpaceParams} from '$lib/vocab/space/space';
import type {Member, MemberParams} from '$lib/vocab/member/member';
import type {File, FileParams} from '$lib/vocab/file/file';
import type {SocketStore} from '$lib/ui/socket';
import type {LoginRequest} from '$lib/session/login_middleware.js';
import type {ClientAccountSession} from '$lib/session/client_session';
import type {ErrorResponse} from '$lib/util/error';

// TODO refactor/rethink

const KEY = Symbol();

export const get_api = (): ApiStore => getContext(KEY);

export const set_api = (store: ApiStore): ApiStore => {
	setContext(KEY, store);
	return store;
};

export interface ApiState {}

export type ApiResult<TValue> = Result<TValue, ErrorResponse>;

export interface ApiStore {
	subscribe: Readable<ApiState>['subscribe'];
	log_in: (
		account_name: string,
		password: string,
	) => Promise<ApiResult<{value: {session: ClientAccountSession}}>>;
	log_out: () => Promise<ApiResult<{}>>;
	select_persona: (persona_id: number) => void;
	select_community: (community_id: number | null) => void;
	select_space: (community_id: number, space: number | null) => void;
	toggle_main_nav: () => void;
	create_community: (
		name: string,
		persona_id: number,
	) => Promise<ApiResult<{value: {community: CommunityModel}}>>;
	create_space: (params: SpaceParams) => Promise<ApiResult<{value: {space: Space}}>>;
	invite_member: (
		community_id: number, // TODO using `Community` instead of `community_id` breaks the pattern above
		persona_id: number,
	) => Promise<ApiResult<{value: {member: Member}}>>;
	create_file: (params: FileParams) => Promise<ApiResult<{value: {file: File}}>>;
	load_files: (space_id: number) => Promise<ApiResult<{value: {file: File[]}}>>;
}

export const to_api_store = (ui: UiStore, data: DataStore, socket: SocketStore): ApiStore => {
	// TODO set the `api` state with progress of remote calls
	const {subscribe} = writable<ApiState>(to_default_api_state());

	// let $ui: UiState;
	// let $data: DataState;
	// ui.subscribe(($u) => ($ui = $u));
	// data.subscribe(($d) => ($data = $d));

	const store: ApiStore = {
		subscribe,
		// TODO these are just directly proxying
		select_persona: ui.select_persona,
		select_community: ui.select_community,
		select_space: ui.select_space,
		toggle_main_nav: ui.toggle_main_nav,
		log_in: async (account_name, password) => {
			console.log('[log_in] logging in with account_name', account_name); // TODO logging
			try {
				const login_request: LoginRequest = {account_name, password};
				const response = await fetch('/api/v1/login', {
					method: 'POST',
					headers: {'content-type': 'application/json'},
					body: JSON.stringify(login_request),
				});
				const response_data = await response.json();
				if (response.ok) {
					console.log('[log_in] response_data', response_data); // TODO logging
					account_name = '';
					session.set(response_data.session);
					return {ok: true, value: response_data};
				} else {
					console.error('[log_in] response not ok', response); // TODO logging
					return {ok: false, reason: response_data.reason};
				}
			} catch (err) {
				console.error('[log_in] error', err); // TODO logging
				return {
					ok: false,
					reason: `Something went wrong. Is your Internet connection working? Maybe the server is busted. Please try again.`,
				};
			}
		},
		log_out: async () => {
			try {
				console.log('[log_out] logging out'); // TODO logging
				const response = await fetch('/api/v1/logout', {
					method: 'POST',
					headers: {'content-type': 'application/json'},
				});
				const response_data = await response.json();
				console.log('[log_out] response', response_data); // TODO logging
				if (response.ok) {
					session.set({guest: true});
					return {ok: true};
				} else {
					console.error('[log_out] response not ok', response); // TODO logging
					return {ok: false, reason: response_data.reason};
				}
			} catch (err) {
				console.error('[log_out] err', err); // TODO logging
				return {
					ok: false,
					reason: `Something went wrong. Is your Internet connection working? Maybe the server is busted. Please try again!`,
				};
			}
		},
		// TODO refactor this, maybe into `data` or `api`
		create_community: async (name, persona_id) => {
			if (!name) return {ok: false, reason: 'invalid name'};
			//Needs to collect name
			const community_params: CommunityParams = {
				name,
				persona_id,
			};
			const res = await fetch(`/api/v1/communities`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(community_params),
			});
			if (res.ok) {
				try {
					const result: {community: Community} = await res.json(); // TODO api types
					console.log('create_community result', result);
					const community = to_community_model(result.community);
					data.add_community(community, persona_id);
					return {ok: true, value: {community}};
				} catch (err) {
					return {ok: false, reason: err.message};
				}
			} else {
				throw Error(`error: ${res.status}: ${res.statusText}`);
			}
		},
		create_space: async (params) => {
			try {
				const res = await fetch(`/api/v1/communities/${params.community_id}/spaces`, {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify(params),
				});
				if (res.ok) {
					const result: {space: Space} = await res.json(); // TODO api types
					console.log('[create_space] result', result);
					data.add_space(result.space, params.community_id);
					return {ok: true, value: result};
				} else {
					const json = await res.json();
					throw Error(`[create_space.failed] ${json.reason}`);
				}
			} catch (err) {
				console.error(err.message);
				return {ok: false, reason: err.message};
			}
		},
		// TODO: This implementation is currently unconsentful,
		// because does not give the potential member an opportunity to deny an invite
		invite_member: async (
			community_id,
			persona_id, // TODO `persona_id`
		) => {
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
					console.log('invite_member result', result);
					data.add_member(result.member);
					return {ok: true, value: result};
				} catch (err) {
					return {ok: false, reason: err.message};
				}
			} else {
				throw Error(`error: ${res.status}: ${res.statusText}`);
			}
		},
		create_file: async (params: FileParams) => {
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
		load_files: async (space_id) => {
			data.set_files(space_id, []);
			const res = await fetch(`/api/v1/spaces/${space_id}/files`);
			if (res.ok) {
				try {
					const json = await res.json();
					data.set_files(space_id, json.files);
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

const to_default_api_state = (): ApiState => ({
	selected_community_id: null,
	selected_space_id_by_community: {},
});
