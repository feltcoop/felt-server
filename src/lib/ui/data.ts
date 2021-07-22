import {writable} from 'svelte/store';
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

export type Data_Store = ReturnType<typeof to_data_store>;

// TODO probably don't want to pass `initial_session` because it'll never be GC'd
export const to_data_store = (initial_session: Client_Session) => {
	const {subscribe, set} = writable(to_default_data(initial_session));
	return {
		subscribe,
		set_session: (session: Client_Session): void => {
			set(to_default_data(session));
		},
	};
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
