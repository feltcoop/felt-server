import type {Readable} from 'svelte/store';
import {writable, derived, get} from 'svelte/store';
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
	selectedPersonaId: number | null; // TODO remove for store
	selectedCommunityId: number | null;
	selectedCommunityIdByPersona: {[key: number]: number};
	selectedSpaceIdByCommunity: {[key: number]: number | null};
	expandMainNav: boolean;
	expandSecondaryNav: boolean; // TODO name?
	mainNavView: MainNavView;
}

export interface UiStore {
	subscribe: Readable<UiState>['subscribe'];
	// derived state
	selectedPersonaId: Readable<number | null>;
	selectedPersona: Readable<Readable<Persona> | null>;
	selectedCommunity: Readable<Community | null>;
	selectedSpace: Readable<Space | null>;
	communitiesByPersonaId: Readable<{[persona_id: number]: Community[]}>; // TODO or name `personaCommunities`?
	// methods
	updateData: (data: DataState) => void;
	selectPersona: (persona_id: number) => void;
	selectCommunity: (community_id: number | null) => void;
	selectSpace: (community_id: number, space_id: number | null) => void;
	toggleMainNav: () => void;
	toggleSecondaryNav: () => void;
	setMainNavView: (mainNavView: MainNavView) => void;
}

export const toUiStore = (data: DataStore): UiStore => {
	const state = writable<UiState>(toDefaultUiState());

	const {subscribe, update} = state;

	// derived state
	// TODO derive from `selectedPersonaId` state -- should it handle any changes to the map? or can/should we assume a store exists? lazy load?
	// TODO speed up these lookups with id maps
	// TODO remove it from `state`
	const selectedPersonaId = derived([state], ([$ui]) => $ui.selectedPersonaId || null);
	const selectedPersona = derived(
		[selectedPersonaId, data.personasById],
		([$selectedPersonaId, $personasById]) =>
			($selectedPersonaId && $personasById.get($selectedPersonaId)) || null,
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
	// TODO this belongs on `data`
	const communitiesByPersonaId = derived(
		[data, data.sessionPersonas],
		([$data, $sessionPersonas]) =>
			$sessionPersonas.reduce((result, persona) => {
				// TODO refactor this to be reactive
				const $persona = get(persona);
				// TODO speed up this lookup, probably with a map of all communities by id
				result[$persona.persona_id] = $data.communities.filter(
					(community) =>
						// TODO why no `community_ids`?
						$persona.community_ids && $persona.community_ids.includes(community.community_id),
				);
				return result;
			}, {} as {[persona_id: number]: Community[]}),
	);

	const store: UiStore = {
		subscribe,
		// derived state
		selectedPersonaId,
		selectedPersona,
		selectedCommunity,
		selectedSpace,
		communitiesByPersonaId,
		// methods
		updateData: (updated) => {
			console.log('[ui.updateData]', {data: updated});
			update(($ui) => {
				// TODO this needs to be rethought, it's just preserving the existing ui state
				// when new data gets set, which happens when e.g. a new community is created --
				// most likely `updateData` *should* wipe away UI state by default,
				// and should not be called when data changes, only when a new session's data is set,
				// so the naming is misleading
				console.log('data.sessionPersonas', get(get(data.sessionPersonas)[0]));
				if (updated.account) {
					let {selectedPersonaId} = $ui;
					if (!selectedPersonaId) {
						const initialSessionPersona = get(data.sessionPersonas)[0];
						if (initialSessionPersona) {
							selectedPersonaId = get(initialSessionPersona).persona_id;
						}
					}
					const selectedCommunity =
						($ui.selectedCommunityId !== null &&
							updated.communities.find((c) => c.community_id === $ui.selectedCommunityId)) ||
						updated.communities[0] ||
						null;
					const newState: UiState = {
						...$ui,
						selectedPersonaId,
						selectedCommunityId: selectedCommunity?.community_id ?? null,
						selectedCommunityIdByPersona: Object.fromEntries(
							get(data.sessionPersonas).map((persona) => {
								// TODO needs to be rethought, the `get` isn't reactive
								const $persona = get(persona);
								console.log('$persona', $persona);
								return [
									$persona.persona_id,
									$ui.selectedCommunityIdByPersona[$persona.persona_id] ??
										($persona.community_ids && $persona.community_ids[0]) ?? // TODO hacky
										null,
								];
							}),
						),
						selectedSpaceIdByCommunity: Object.fromEntries(
							updated.communities.map((community) => [
								community.community_id,
								$ui.selectedSpaceIdByCommunity[community.community_id] ??
									community.spaces[0]?.space_id ??
									null,
							]),
						),
					};
					return newState;
				} else {
					// might want to preserve some state, so this doesn't use `toDefaultUiState`
					const newState: UiState = {
						...$ui,
						selectedPersonaId: null,
						selectedCommunityId: null,
						selectedCommunityIdByPersona: {},
						selectedSpaceIdByCommunity: {},
						mainNavView: 'explorer',
					};
					return newState;
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

const toDefaultUiState = (): UiState => ({
	selectedPersonaId: null,
	selectedCommunityId: null,
	selectedCommunityIdByPersona: {},
	selectedSpaceIdByCommunity: {},
	expandMainNav: true,
	expandSecondaryNav: true, // TODO default to `false` for mobile -- how?
	mainNavView: 'explorer',
});

export type MainNavView = 'explorer' | 'account';
