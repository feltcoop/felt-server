import type {Readable} from 'svelte/store';
import {writable, derived} from 'svelte/store';
import {setContext, getContext} from 'svelte';

import type {DataState, DataStore} from '$lib/ui/data';
import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {Persona} from '$lib/vocab/persona/persona';

// TODO in the current design,
// the methods on the `UiStore` should not be called directly in an app context.
// They're intended to be called by the api for future orchestration reasons.
// Of course you can make more of these stores than what's given to you in the app,
// and call methods all you want without weird bugs.
// Use cases may include documentation and dueling apps.

const KEY = Symbol();

export const getUi = (): UiStore => getContext(KEY);

export const setUi = (store: UiStore): UiStore => {
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
	expandSecondaryNav: boolean; // TODO name?
	mainNavView: MainNavView;
}

export interface UiStore {
	subscribe: Readable<UiState>['subscribe'];
	// state
	// derived state
	selectedPersona: Readable<Persona | null>;
	selectedCommunity: Readable<Community | null>;
	selectedSpace: Readable<Space | null>;
	communitiesByPersonaId: Readable<{[persona_id: number]: Community[]}>; // TODO or name `personaCommunities`?
	// methods and stores
	mobile: Readable<boolean>;
	setMobile: (mobile: boolean) => void;
	updateData: (data: DataState) => void;
	selectPersona: (persona_id: number) => void;
	selectCommunity: (community_id: number | null) => void;
	selectSpace: (community_id: number, space_id: number | null) => void;
	toggleMainNav: () => void;
	toggleSecondaryNav: () => void;
	setMainNavView: (mainNavView: MainNavView) => void;
}

export const toUiStore = (data: DataStore, mobile: boolean) => {
	const state = writable<UiState>(toDefaultUiState(mobile));

	const {subscribe, update} = state;

	const {subscribe: subscribeMobile, set: setMobile} = writable(mobile);

	// derived state
	// TODO speed up these lookups with id maps
	const selectedPersona = derived(
		[state, data],
		([$ui, $data]) => $data.personas.find((p) => p.persona_id === $ui.selectedPersonaId) || null,
	);
	const selectedCommunity = derived(
		[state, data],
		([$ui, $data]) =>
			$data.communities.find((c) => c.community_id === $ui.selectedCommunityId) || null,
	);
	const selectedSpace = derived(
		[state, selectedCommunity],
		([$ui, $selectedCommunity]) =>
			$selectedCommunity?.spaces.find(
				(s) => s.space_id === $ui.selectedSpaceIdByCommunity[$selectedCommunity.community_id],
			) || null,
	);
	const communitiesByPersonaId = derived([data], ([$data]) =>
		$data.personas.reduce((result, persona) => {
			// TODO speed up this lookup, probably with a map of all communities by id
			result[persona.persona_id] = $data.communities.filter((community) =>
				persona.community_ids.includes(community.community_id),
			);
			return result;
		}, {} as {[persona_id: number]: Community[]}),
	);

	const store: UiStore = {
		subscribe,
		// derived state
		selectedPersona,
		selectedCommunity,
		selectedSpace,
		communitiesByPersonaId,
		// methods and stores
		mobile: {subscribe: subscribeMobile}, // don't expose the writable store
		setMobile,
		updateData: (data) => {
			console.log('[ui.updateData]', {data});
			update(($ui) => {
				// TODO this needs to be rethought, it's just preserving the existing ui state
				// when new data gets set, which happens when e.g. a new community is created --
				// most likely `updateData` *should* wipe away UI state by default,
				// and should not be called when data changes, only when a new session's data is set,
				// so the naming is misleading
				if (data.account) {
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
		toggleSecondaryNav: () => {
			update(($ui) => ({...$ui, expandSecondaryNav: !$ui.expandSecondaryNav}));
		},
		setMainNavView: (mainNavView) => {
			update(($ui) => ({...$ui, mainNavView}));
		},
	};
	return store;
};

const toDefaultUiState = (mobile: boolean): UiState => ({
	expandMainNav: !mobile,
	expandSecondaryNav: !mobile,
	mainNavView: 'explorer',
	selectedPersonaId: null,
	selectedCommunityId: null,
	selectedCommunityIdByPersona: {},
	selectedSpaceIdByCommunity: {},
});

export type MainNavView = 'explorer' | 'account';
