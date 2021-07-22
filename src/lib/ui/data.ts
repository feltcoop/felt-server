import {writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';

import type {Client_Account, Client_Session} from '$lib/session/client_session';
import type {Community} from '$lib/communities/community';
import type {Member} from '$lib/members/member';

const KEY = Symbol();

export const get_data = (): Data_Store => getContext(KEY);

export const set_data = (session: Client_Session): Data_Store => {
	const store = to_data_store(session);
	setContext(KEY, store);
	return store;
};

export interface Data_State {
	account: Client_Account;
	communities: Community[];
	friends: Member[];
}

export interface Data_Store {
	subscribe: Readable<Data_State>['subscribe'];
	set_session: (session: Client_Session) => void;
	add_community: (community: Community) => void;
}

// TODO probably don't want to pass `initial_session` because it'll never be GC'd
export const to_data_store = (initial_session: Client_Session): Data_Store => {
	const {subscribe, set, update} = writable(to_default_data(initial_session));
	const store: Data_Store = {
		subscribe,
		set_session: (session: Client_Session): void => {
			console.log('[data.set_session]', session);
			set(to_default_data(session));
		},
		add_community: (community: Community): void => {
			// TODO instead of this, probably want to set more granularly with nested stores
			console.log('[data.add_community]', community);
			update(($data) => ({...$data, communities: $data.communities.concat(community)}));
		},
	};
	return store;
};

const to_default_data = (session: Client_Session): Data_State => {
	if (session.guest) {
		return null as any;
	} else {
		return {
			account: session.account,
			communities: session.communities.map((community) => {
				community.members_by_id = new Map(
					community.members.map((member) => [member.account_id, member]),
				);
				return community;
			}),
			friends: session.friends,
		};
	}
};
