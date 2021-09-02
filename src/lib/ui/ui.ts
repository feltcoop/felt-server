import type {Readable} from 'svelte/store';
import {writable} from 'svelte/store';
import {setContext, getContext} from 'svelte';
import type {DataState} from '$lib/ui/data';

// TODO refactor/rethink

const KEY = Symbol();

export const get_ui = (): UiStore => getContext(KEY);

export const set_ui = (store: UiStore = to_ui_store()): UiStore => {
	setContext(KEY, store);
	return store;
};

export interface UiState {
	// TODO should these be store references instead of ids?
	selected_persona_id: number | null;
	selected_community_id: number | null;
	selected_community_id_by_persona: {[key: number]: number};
	selected_space_id_by_community: {[key: number]: number | null};
	expand_main_nav: boolean;
	main_nav_view: MainNavView;
}

export interface UiStore {
	subscribe: Readable<UiState>['subscribe'];
	update_data: (data: DataState | null) => void;
	select_persona: (persona_id: number) => void;
	select_community: (community_id: number | null) => void;
	select_space: (community_id: number, space_id: number | null) => void;
	toggle_main_nav: () => void;
	set_main_nav_view: (main_nav_view: MainNavView) => void;
}

export const to_ui_store = () => {
	const {subscribe, update} = writable<UiState>(to_default_ui_state());

	const store: UiStore = {
		subscribe,
		update_data: (data: DataState | null) => {
			update(($ui) => {
				// TODO this needs to be rethought, it's just preserving the existing ui state
				// when new data gets set, which happens when e.g. a new community is created --
				// most likely `update_data` *should* wipe away UI state by default,
				// and should not be called when data changes, only when a new session's data is set,
				// so the naming is misleading
				if (data) {
					const selected_persona =
						($ui.selected_persona_id !== null &&
							data.personas.find((c) => c.persona_id === $ui.selected_persona_id)) ||
						data.personas[0] ||
						null;
					console.log('ui selected_persona is', selected_persona);
					const selected_community =
						($ui.selected_community_id !== null &&
							data.communities.find((c) => c.community_id === $ui.selected_community_id)) ||
						data.communities[0] ||
						null;
					return {
						...$ui,
						selected_persona_id: selected_persona?.persona_id ?? null,
						selected_community_id: selected_community?.community_id ?? null,
						selected_community_id_by_persona: Object.fromEntries(
							data.personas.map((persona) => [
								persona.persona_id,
								$ui.selected_community_id_by_persona[persona.persona_id] ??
									// TODO this type is wrong, need to change the postgres query probably
									persona.community_ids[0] ??
									null,
							]),
						),
						selected_space_id_by_community: Object.fromEntries(
							data.communities.map((community) => [
								community.community_id,
								$ui.selected_space_id_by_community[community.community_id] ??
									community.spaces[0]?.space_id ??
									null,
							]),
						),
					};
				} else {
					// might want to preserve some state, so this doesn't use `to_default_ui_state`
					return {
						...$ui,
						selected_persona_id: null,
						selected_community_id: null,
						selected_community_id_by_persona: {},
						selected_space_id_by_community: {},
						main_nav_view: 'explorer',
					};
				}
			});
		},
		select_persona: (persona_id: number) => {
			console.log(typeof persona_id);
			update(($ui) => ({
				...$ui,
				selected_persona_id: persona_id,
				selected_community_id: $ui.selected_community_id_by_persona[persona_id],
			}));
		},
		select_community: (community_id: number | null) => {
			console.log('[ui.select_community] community_id', {community_id});
			update(($ui) => ({
				...$ui,
				selected_community_id: community_id,
				selected_community_id_by_persona:
					community_id === null || $ui.selected_persona_id === null
						? $ui.selected_community_id_by_persona
						: {
								...$ui.selected_community_id_by_persona,
								[$ui.selected_persona_id]: community_id,
						  },
			}));
		},
		select_space: (community_id: number, space_id: number | null) => {
			console.log('[ui.select_space] community_id, space_id', {community_id, space_id});
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
		toggle_main_nav: () => {
			update(($ui) => ({...$ui, expand_main_nav: !$ui.expand_main_nav}));
		},
		set_main_nav_view: (main_nav_view) => {
			update(($ui) => ({...$ui, main_nav_view}));
		},
	};
	return store;
};

const to_default_ui_state = (): UiState => ({
	selected_persona_id: null,
	selected_community_id: null,
	selected_community_id_by_persona: {},
	selected_space_id_by_community: {},
	expand_main_nav: true,
	main_nav_view: 'explorer',
});

export type MainNavView = 'explorer' | 'account';
