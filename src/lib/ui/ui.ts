import {writable} from 'svelte/store';
import {setContext, getContext} from 'svelte';
import type {Data_State} from '$lib/ui/data';

const KEY = Symbol();

export const get_ui = (): Ui_Store => getContext(KEY);

export const set_ui = (store: Ui_Store = to_ui_store()): Ui_Store => {
	setContext(KEY, store);
	return store;
};

export interface Ui_State {
	// TODO should these be store references instead of ids?
	selected_community_id: number | null;
	selected_space_id_by_community: {[key: number]: number | null};
}

// TODO is this the preferred type definition?
export type Ui_Store = ReturnType<typeof to_ui_store>;

export const to_ui_store = () => {
	const {subscribe, update} = writable<Ui_State>(to_default_ui_state());

	return {
		subscribe,
		set_data: (data: Data_State | null) => {
			update(($ui) => {
				if (data) {
					const selected_community = data.communities[0] || null;
					return {
						...$ui,
						selected_community_id: selected_community?.community_id || null,
						selected_space_id_by_community: Object.fromEntries(
							data.communities.map((community) => [
								community.community_id!,
								community.spaces[0]?.space_id || null,
							]),
						),
					};
				} else {
					// might want to preserve some state, so this doesn't use `to_default_ui_state`
					return {
						...$ui,
						selected_community_id: null,
						selected_space_id_by_community: {},
					};
				}
			});
		},
		select_community: (community_id: number | null) => {
			update(($ui) => ({...$ui, selected_community_id: community_id}));
		},
		select_space: (community_id: number, space_id: number | null) => {
			update(($ui) => {
				// TODO speed this up using stores maybe?
				return {
					...$ui,
					selected_space_id_by_community: {
						...$ui.selected_space_id_by_community,
						[community_id]: space_id,
					},
				};
			});
		},
	};
};

const to_default_ui_state = (): Ui_State => ({
	selected_community_id: null,
	selected_space_id_by_community: {},
});
