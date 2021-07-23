import {writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';
import type {Result} from '@feltcoop/felt';

import type {Data_Store} from '$lib/ui/data';
import type {Ui_Store} from '$lib/ui/ui';
import type {Community} from '$lib/communities/community';
import type {Space, Space_Client_Doc} from '$lib/spaces/space';
import type {Member} from '$lib/members/member';

const KEY = Symbol();

export const get_api = (): Api_Store => getContext(KEY);

export const set_api = (store: Api_Store): Api_Store => {
	setContext(KEY, store);
	return store;
};

export interface Api_State {}

export interface Api_Store {
	subscribe: Readable<Api_State>['subscribe'];
	select_community: (community_id: number) => void;
	select_space: (community_id: number, space: number | null) => void;
	create_community: (
		name: string,
	) => Promise<Result<{value: {community: Community}}, {reason: string}>>;
	create_space: (
		community_id: number, // TODO using `Community` instead of `community_id` breaks the pattern above
		name: string,
		url: string,
		media_type: string,
		content: string,
	) => Promise<Result<{value: {space: Space}}, {reason: string}>>;
	invite_member: (
		community_id: number, // TODO using `Community` instead of `community_id` breaks the pattern above
		account_id: number,
	) => Promise<Result<{value: {member: Member}}, {reason: string}>>;
}

export const to_api_store = (ui: Ui_Store, data: Data_Store): Api_Store => {
	const {subscribe, update} = writable<Api_State>(to_default_api_state());

	const store: Api_Store = {
		subscribe,
		select_community: (community_id) => {
			ui.select_community(community_id!);
		},
		select_space: (community_id, space_id) => {
			ui.select_space(community_id, space_id);
		},
		// TODO refactor this, maybe into `data` or `api`
		create_community: async (name) => {
			if (!name) return {ok: false, reason: 'invalid name'};
			//Needs to collect name
			const doc = {
				name,
			};
			const res = await fetch(`/api/v1/communities`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify(doc),
			});
			try {
				const result: {community: Community} = await res.json(); // TODO api types
				console.log('create_community result', result);
				data.add_community(result.community);
				return {ok: true, value: result};
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
			const doc: Space_Client_Doc = {
				community_id,
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
				data.add_space(result.space);
				return {ok: true, value: result};
			} catch (err) {
				return {ok: false, reason: err.message};
			}
		},
		// TODO: This implementation is currently unconsentful,
		// because does not give the potential member an opportunity to deny an invite
		invite_member: async (
			community_id: number,
			account_id: Member, // TODO `persona_id`
		): Promise<Result<{value: {member: Member}}, {reason: string}>> => {
			// TODO proper automated validation
			if (community_id == null) return {ok: false, reason: 'invalid url'};
			if (!account_id) return {ok: false, reason: 'invalid member'};

			const doc = {
				account_id,
			};

			const res = await fetch(`/api/v1/communities/${community_id}/members`, {
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
	};
	return store;
};

const to_default_api_state = (): Api_State => ({
	selected_community_id: null,
	selected_space_id_by_community: {},
});
