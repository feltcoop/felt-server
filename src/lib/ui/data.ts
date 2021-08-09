import {writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';

import type {Client_Account, Client_Session} from '$lib/session/client_session';
import {Community_Model, to_community_model} from '$lib/communities/community';
import type {Member} from '$lib/members/member';
import type {Space} from '$lib/spaces/space';

// TODO refactor/rethink

// TODO name? maybe `db`? do we need more abstractions?

const KEY = Symbol();

export const get_data = (): Data_Store => getContext(KEY);

export const set_data = (session: Client_Session): Data_Store => {
	const store = to_data_store(session);
	setContext(KEY, store);
	return store;
};

export interface Data_State {
	account: Client_Account;
	communities: Community_Model[];
	spaces: Space[];
	members: Member[];
}

export interface Data_Store {
	subscribe: Readable<Data_State>['subscribe'];
	update_session: (session: Client_Session) => void;
	add_community: (community: Community_Model) => void;
	add_space: (space: Space, community_id: number) => void;
	add_member: (member: Member) => void;
}

// TODO probably don't want to pass `initial_session` because it'll never be GC'd
export const to_data_store = (initial_session: Client_Session): Data_Store => {
	const {subscribe, set, update} = writable(to_default_data(initial_session));
	const store: Data_Store = {
		subscribe,
		update_session: (session) => {
			console.log('[data.update_session]', session);
			set(to_default_data(session));
		},
		add_community: (community) => {
			// TODO instead of this, probably want to set more granularly with nested stores
			console.log('[data.add_community]', community);
			update(($data) => ({...$data, communities: $data.communities.concat(community)}));
		},
		add_space: (space, community_id) => {
			// TODO instead of this, probably want to set more granularly with nested stores
			console.log('[data.add_space]', space);
			update(($data) => ({
				...$data,
				spaces: $data.spaces.concat(space),
				communities: $data.communities.map((community) =>
					community.community_id !== community_id
						? community
						: {
								...community,
								spaces: community.spaces.concat(space),
						  },
				),
			}));
		},
		add_member: (member) => {
			// TODO instead of this, probably want to set more granularly with nested stores
			console.log('[data.add_member]', member);
			update(($data) => ({...$data, members: $data.members.concat(member)}));
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
			communities: session.communities.map((community) => to_community_model(community)),
			// TODO session should already have a flat array of spaces
			spaces: session.communities.flatMap((community) => community.spaces),
			members: session.members,
		};
	}
};
