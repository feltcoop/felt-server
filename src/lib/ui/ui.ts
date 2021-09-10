import type {Readable} from 'svelte/store';
import {writable} from 'svelte/store';
import {setContext, getContext} from 'svelte';
import type {DataState} from '$lib/ui/data';

// TODO refactor/rethink

const KEY = Symbol();

export const getUi = (): UiStore => getContext(KEY);

export const setUi = (store: UiStore = toUiStore()): UiStore => {
	setContext(KEY, store);
	return store;
};

export interface UiState {
	// TODO should these be store references instead of ids?
	selectedPersonaId: number | null;
	selectedCommunityId: number | null;
	selectedCommunityIdByPersona: {[key: number]: number};
	selectedSpaceIdByCommunity: {[key: number]: number | null};
	expandMainNav: boolean;
	mainNavView: MainNavView;
}

export interface UiStore {
	subscribe: Readable<UiState>['subscribe'];
	updateData: (data: DataState | null) => void;
	selectPersona: (persona_id: number) => void;
	selectCommunity: (community_id: number | null) => void;
	selectSpace: (community_id: number, space_id: number | null) => void;
	toggleMainNav: () => void;
	setMainNavView: (mainNavView: MainNavView) => void;
}

export const toUiStore = () => {
	const {subscribe, update} = writable<UiState>(toDefaultUiState());

	const store: UiStore = {
		subscribe,
		updateData: (data) => {
			console.log('[ui.updateData]', {data});
			update(($ui) => {
				// TODO this needs to be rethought, it's just preserving the existing ui state
				// when new data gets set, which happens when e.g. a new community is created --
				// most likely `updateData` *should* wipe away UI state by default,
				// and should not be called when data changes, only when a new session's data is set,
				// so the naming is misleading
				if (data) {
					const selectedPersona =
						($ui.selectedPersonaId !== null &&
							data.personas.find((c) => c.persona_id === $ui.selectedPersonaId)) ||
						data.personas[0] ||
						null;
					console.log('ui selectedPersona is', selectedPersona);
					const selectedCommunity =
						($ui.selectedCommunityId !== null &&
							data.communities.find((c) => c.community_id === $ui.selectedCommunityId)) ||
						data.communities[0] ||
						null;
					return {
						...$ui,
						selectedPersonaId: selectedPersona?.persona_id ?? null,
						selectedCommunityId: selectedCommunity?.community_id ?? null,
						selectedCommunityIdByPersona: Object.fromEntries(
							data.personas.map((persona) => [
								persona.persona_id,
								$ui.selectedCommunityIdByPersona[persona.persona_id] ??
									persona.community_ids[0] ??
									null,
							]),
						),
						selectedSpaceIdByCommunity: Object.fromEntries(
							data.communities.map((community) => [
								community.community_id,
								$ui.selectedSpaceIdByCommunity[community.community_id] ??
									community.spaces[0]?.space_id ??
									null,
							]),
						),
					};
				} else {
					// might want to preserve some state, so this doesn't use `toDefaultUiState`
					return {
						...$ui,
						selectedPersonaId: null,
						selectedCommunityId: null,
						selectedCommunityIdByPersona: {},
						selectedSpaceIdByCommunity: {},
						mainNavView: 'explorer',
					};
				}
			});
		},
		selectPersona: (persona_id) => {
			console.log('[ui.selectPersona] persona_id', {persona_id});
			update(($ui) => ({
				...$ui,
				selectedPersonaId: persona_id,
				selectedCommunityId: $ui.selectedCommunityIdByPersona[persona_id],
			}));
		},
		selectCommunity: (community_id) => {
			console.log('[ui.selectCommunity] community_id', {community_id});
			update(($ui) => ({
				...$ui,
				selectedCommunityId: community_id,
				selectedCommunityIdByPersona:
					community_id === null || $ui.selectedPersonaId === null
						? $ui.selectedCommunityIdByPersona
						: {
								...$ui.selectedCommunityIdByPersona,
								[$ui.selectedPersonaId]: community_id,
						  },
			}));
		},
		selectSpace: (community_id, space_id) => {
			console.log('[ui.selectSpace] community_id, space_id', {community_id, space_id});
			update(($ui) => {
				// TODO speed this up using stores maybe?
				return {
					...$ui,
					selectedSpaceIdByCommunity: {
						...$ui.selectedSpaceIdByCommunity,
						[community_id]: space_id,
					},
				};
			});
		},
		toggleMainNav: () => {
			update(($ui) => ({...$ui, expandMainNav: !$ui.expandMainNav}));
		},
		setMainNavView: (mainNavView) => {
			update(($ui) => ({...$ui, mainNavView}));
		},
	};
	return store;
};

const toDefaultUiState = (): UiState => ({
	selectedPersonaId: null,
	selectedCommunityId: null,
	selectedCommunityIdByPersona: {},
	selectedSpaceIdByCommunity: {},
	expandMainNav: true,
	mainNavView: 'explorer',
});

export type MainNavView = 'explorer' | 'account';
