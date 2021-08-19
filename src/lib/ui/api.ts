import {writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';
import type {Result} from '@feltcoop/felt';

import type {DataStore} from '$lib/ui/data';
import type {UiStore} from '$lib/ui/ui';
import type {Community, CommunityModel, CommunityParams} from '$lib/communities/community';
import {to_community_model} from '$lib/communities/community';
import type {Space, SpaceParams} from '$lib/spaces/space';
import type {Member, MemberParams} from '$lib/members/member';
import type {Post} from '$lib/posts/post';
import type {SocketStore} from '$lib/ui/socket';

// TODO refactor/rethink

const KEY = Symbol();

export const get_api = (): ApiStore => getContext(KEY);

export const set_api = (store: ApiStore): ApiStore => {
	setContext(KEY, store);
	return store;
};

export interface ApiState {}

export interface ApiStore {
	subscribe: Readable<ApiState>['subscribe'];
	select_community: (community_id: number | null) => void;
	select_space: (community_id: number, space: number | null) => void;
	toggle_main_nav: () => void;
	create_community: (
		name: string,
	) => Promise<Result<{value: {community: CommunityModel}}, {reason: string}>>;
	create_space: (
		community_id: number, // TODO using `Community` instead of `community_id` breaks the pattern above
		name: string,
		url: string,
		media_type: string,
		content: string,
	) => Promise<Result<{value: {space: Space}}, {reason: string}>>;
	invite_member: (
		community_id: number, // TODO using `Community` instead of `community_id` breaks the pattern above
		persona_id: number,
	) => Promise<Result<{value: {member: Member}}, {reason: string}>>;
	create_post: (
		space: Space,
		content: string,
	) => Promise<Result<{value: {post: Post}}, {reason: string}>>;
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
		select_community: ui.select_community,
		select_space: ui.select_space,
		toggle_main_nav: ui.toggle_main_nav,
		// TODO refactor this, maybe into `data` or `api`
		create_community: async (name) => {
			if (!name) return {ok: false, reason: 'invalid name'};
			//Needs to collect name
			const community_params: CommunityParams = {
				name,
			};
			const res = await fetch(`/api/v1/communities`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(community_params),
			});
			try {
				const result: {community: Community} = await res.json(); // TODO api types
				console.log('create_community result', result);
				const community = to_community_model(result.community);
				data.add_community(community);
				return {ok: true, value: {community}};
			} catch (err) {
				return {ok: false, reason: err.message};
			}
		},
		create_space: async (community_id, name, url, media_type, content) => {
			// TODO proper automated validation
			if (community_id == null) return {ok: false, reason: 'invalid url'};
			if (!name) return {ok: false, reason: 'invalid name'};
			if (!url) return {ok: false, reason: 'invalid url'};
			if (!media_type) return {ok: false, reason: 'invalid meta_type'};
			if (!content) return {ok: false, reason: 'invalid content'};
			//Needs to collect name
			const doc: SpaceParams = {
				name,
				url,
				media_type,
				content,
			};
			const res = await fetch(`/api/v1/communities/${community_id}/spaces`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(doc),
			});
			try {
				const result: {space: Space} = await res.json(); // TODO api types
				console.log('create_space result', result);
				data.add_space(result.space, community_id);
				return {ok: true, value: result};
			} catch (err) {
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
			try {
				const result: {member: Member} = await res.json(); // TODO api types
				console.log('invite_member result', result);
				data.add_member(result.member);
				return {ok: true, value: result};
			} catch (err) {
				return {ok: false, reason: err.message};
			}
		},
		create_post: async (space, content) => {
			const res = await fetch(`/api/v1/spaces/${space.space_id}/posts`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({content}),
			});
			if (res.ok) {
				console.log('post sent, broadcasting to server');
				const data = await res.json();
				socket.send(data); // TODO refactor
				return {ok: true, value: data};
			} else {
				throw Error(`error sending post: ${res.status}: ${res.statusText}`);
			}
		},
	};
	return store;
};

const to_default_api_state = (): ApiState => ({
	selected_community_id: null,
	selected_space_id_by_community: {},
});
