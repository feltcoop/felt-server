import {writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';

import type {ClientSession} from '$lib/session/client_session';
import {to_community_model} from '$lib/vocab/community/community';
import type {CommunityModel} from '$lib/vocab/community/community';
import type {Member} from '$lib/vocab/member/member';
import type {Space} from '$lib/vocab/space/space';
import type {AccountModel} from '$lib/vocab/account/account';
import type {Persona} from '$lib/vocab/persona/persona';
import type {Post} from '$lib/vocab/post/post';

// TODO refactor/rethink

// TODO name? maybe `db`? do we need more abstractions?

const KEY = Symbol();

export const get_data = (): DataStore => getContext(KEY);

export const set_data = (session: ClientSession): DataStore => {
	const store = to_data_store(session);
	setContext(KEY, store);
	return store;
};

export interface DataState {
	account: AccountModel;
	communities: CommunityModel[];
	spaces: Space[];
	members: Member[];
	personas: Persona[];
	posts_by_space: Record<number, Post[]>;
}

export interface DataStore {
	subscribe: Readable<DataState>['subscribe'];
	update_session: (session: ClientSession) => void;
	add_community: (community: CommunityModel) => void;
	add_space: (space: Space, community_id: number) => void;
	add_member: (member: Member) => void;
	add_post: (post: Post) => void;
	set_posts: (space_id: number, posts: Post[]) => void;
}

// TODO probably don't want to pass `initial_session` because it'll never be GC'd
export const to_data_store = (initial_session: ClientSession): DataStore => {
	const {subscribe, set, update} = writable(to_default_data(initial_session));
	const store: DataStore = {
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
		add_post: (post) => {
			console.log('[data.add_post]', post);
			update(($data) => ({
				...$data,
				posts_by_space: {
					...$data.posts_by_space,
					[post.space_id]: ($data.posts_by_space[post.space_id] || []).concat(post),
				},
			}));
		},
		set_posts: (space_id, posts) => {
			console.log('[data.set_posts]', posts);
			update(($data) => ({
				...$data,
				posts_by_space: {
					...$data.posts_by_space,
					[space_id]: posts,
				},
			}));
		},
	};
	return store;
};

const to_default_data = (session: ClientSession): DataState => {
	if (session.guest) {
		return null as any;
	} else {
		return {
			account: session.account,
			communities: session.communities.map((community) => to_community_model(community)),
			// TODO session should already have a flat array of spaces
			spaces: session.communities.flatMap((community) => community.spaces),
			members: session.members,
			personas: session.personas,
			posts_by_space: {},
		};
	}
};
