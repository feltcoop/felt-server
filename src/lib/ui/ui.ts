import type {Readable, Writable} from 'svelte/store';
import {writable, derived, get} from 'svelte/store';
import {setContext, getContext} from 'svelte';

import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {Persona} from '$lib/vocab/persona/persona';
import type {ClientSession} from '$lib/session/clientSession';
import type {AccountModel} from '$lib/vocab/account/account';
import type {File} from '$lib/vocab/file/file';
import type {Membership} from '$lib/vocab/membership/membership';

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
	communities: Community[];
	memberships: Membership[]; // TODO needs to be used, currently only gets populated when a new membership is created
	spaces: Space[];
	filesBySpace: Record<number, File[]>;
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
	// TODO this is actually a writable as implemented, but with the type do we care?
	// or do we want to protect the API from being called in unexpected ways?
	account: Readable<AccountModel | null>;
	personas: Readable<Readable<Persona>[]>;
	personasById: Readable<Map<number, Readable<Persona>>>;
	sessionPersonas: Readable<Readable<Persona>[]>;
	setSession: (session: ClientSession) => void;
	addPersona: (persona: Persona) => void;
	addCommunity: (community: Community, persona_id: number) => void;
	addMembership: (membership: Membership) => void;
	addSpace: (space: Space, community_id: number) => void;
	addFile: (file: File) => void;
	setFiles: (space_id: number, files: File[]) => void;
	// TODO experimental api -- returning derived stores as lazily created live queries
	// findPersonasByIdByCommunity: (community_id: number) => Readable<Map<number, Persona>>;
	findPersonaById: (persona_id: number) => Readable<Persona>;
	// derived state
	selectedPersonaId: Readable<number | null>;
	selectedPersona: Readable<Readable<Persona> | null>;
	selectedCommunity: Readable<Community | null>;
	selectedSpace: Readable<Space | null>;
	communitiesByPersonaId: Readable<{[persona_id: number]: Community[]}>; // TODO or name `personaCommunities`?
	// methods
	selectPersona: (persona_id: number) => void;
	selectCommunity: (community_id: number | null) => void;
	selectSpace: (community_id: number, space_id: number | null) => void;
	toggleMainNav: () => void;
	toggleSecondaryNav: () => void;
	setMainNavView: (mainNavView: MainNavView) => void;
}

export const toUiStore = (session: Readable<ClientSession>): UiStore => {
	const initialSession = get(session);
	const state = writable<UiState>(toDefaultUiState(initialSession));

	const {subscribe, update} = state;

	// TODO would it helpfully simplify things to put these stores on the actual store state?
	// Could then put these calculations in one place.
	const account = writable<AccountModel | null>(
		initialSession.guest ? null : initialSession.account, // TODO shared helper with the session updater?
	);

	// TODO this is a hack until we have `community_ids` normalized and off the `Persona`,
	// the issue is that the "session personas" are different than the rest of the personas
	// by having their `community_ids` populated, so we need to prefer that instance in the global
	// persona map (or we could store `sessionPersonasById` separately?
	// maybe not, because we probably want `community_ids` for all personas anyway, lazily loaded)
	const initialPersonas = initialSession.guest
		? []
		: initialSession.personas.concat(
				initialSession.allPersonas.filter(
					(p1) => !initialSession.personas.find((p2) => p2.persona_id === p1.persona_id),
				),
		  );
	// importantly, this only changes when items are added or removed from the collection,
	// not when the items themselves change; each item is a store that can be subscribed to
	const personas = writable<Writable<Persona>[]>(
		initialSession.guest ? [] : initialPersonas.map((p) => writable(p)),
	);
	// TODO do this more efficiently
	const personasById: Readable<Map<number, Writable<Persona>>> = derived(
		personas,
		($personas) => new Map($personas.map((persona) => [get(persona).persona_id, persona])),
	);
	// not derived from session because the session has only the initial snapshot
	const sessionPersonas = writable<Writable<Persona>[]>(
		initialSession.guest
			? []
			: initialSession.personas.map((p) => get(personasById).get(p.persona_id)!),
	);

	// derived state
	// TODO derive from `selectedPersonaId` state -- should it handle any changes to the map? or can/should we assume a store exists? lazy load?
	// TODO speed up these lookups with id maps
	// TODO remove it from `state`
	const selectedPersonaId = derived([state], ([$ui]) => $ui.selectedPersonaId || null);
	const selectedPersona = derived(
		[selectedPersonaId, personasById],
		([$selectedPersonaId, $personasById]) =>
			($selectedPersonaId && $personasById.get($selectedPersonaId)) || null,
	);
	const selectedCommunity = derived(
		[state],
		([$ui]) => $ui.communities.find((c) => c.community_id === $ui.selectedCommunityId) || null,
	);
	const selectedSpace = derived(
		[state, selectedCommunity],
		([$ui, $selectedCommunity]) =>
			$selectedCommunity?.spaces.find(
				(s) => s.space_id === $ui.selectedSpaceIdByCommunity[$selectedCommunity.community_id],
			) || null,
	);
	const communitiesByPersonaId = derived([state, sessionPersonas], ([$ui, $sessionPersonas]) =>
		$sessionPersonas.reduce((result, persona) => {
			// TODO refactor this to be reactive
			const $persona = get(persona);
			// TODO speed up this lookup, probably with a map of all communities by id
			result[$persona.persona_id] = $ui.communities.filter(
				(community) =>
					// TODO why no `community_ids`?
					$persona.community_ids && $persona.community_ids.includes(community.community_id),
			);
			return result;
		}, {} as {[persona_id: number]: Community[]}),
	);

	const store: UiStore = {
		subscribe,
		account,
		personas,
		personasById,
		sessionPersonas,
		setSession: (session) => {
			console.log('[data.setSession]', session);
			const updated = toDefaultUiState(session);
			account.set(session.guest ? null : session.account);
			// TODO update all of the writable stores
			update(($ui) => {
				// TODO this needs to be rethought, it's just preserving the existing ui state
				// when new data gets set, which happens when e.g. a new community is created --
				// most likely `updateData` *should* wipe away UI state by default,
				// and should not be called when data changes, only when a new session's data is set,
				// so the naming is misleading
				console.log('data.sessionPersonas', get(get(sessionPersonas)[0]));
				if (!session.guest) {
					let {selectedPersonaId} = $ui;
					if (!selectedPersonaId) {
						const initialSessionPersona = get(sessionPersonas)[0];
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
						...updated,
						selectedPersonaId,
						selectedCommunityId: selectedCommunity?.community_id ?? null,
						selectedCommunityIdByPersona: Object.fromEntries(
							get(sessionPersonas).map((persona) => {
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
					return updated;
				}
			});
		},
		addPersona: (persona) => {
			console.log('[data.addPersona]', persona);
			const personaStore = writable(persona);
			personas.update(($personas) => $personas.concat(personaStore));
			// TODO better way to check this? should `sessionPersonas` be a `derived` store?
			if (persona.account_id == get(account)?.account_id) {
				sessionPersonas.update(($sessionPersonas) => $sessionPersonas.concat(personaStore));
			}
		},
		addCommunity: (community, persona_id) => {
			// TODO instead of this, probably want to set more granularly with nested stores
			console.log('[data.addCommunity]', community, persona_id);
			// TODO update `personas` writable
			console.log('get(personasById)', get(personasById));
			const persona = get(personasById).get(persona_id)!;
			persona.update(($persona) => ({
				...$persona,
				// TODO how should this be modeled and kept up to date?
				community_ids: $persona.community_ids.concat(community.community_id),
			}));
			update(($ui) => ({
				...$ui,
				communities: $ui.communities.concat(community),
			}));
		},
		addMembership: (membership) => {
			// TODO instead of this, probably want to set more granularly with nested stores
			console.log('[data.addMembership]', membership);
			update(($ui) => ({
				...$ui,
				memberships: $ui.memberships.concat(membership),
				// TODO update `communities.personas` (which will be refactored)
			}));
		},
		addSpace: (space, community_id) => {
			// TODO instead of this, probably want to set more granularly with nested stores
			console.log('[data.addSpace]', space);
			update(($ui) => ({
				...$ui,
				spaces: $ui.spaces.concat(space),
				communities: $ui.communities.map((community) =>
					community.community_id !== community_id
						? community
						: {
								...community,
								spaces: community.spaces.concat(space),
						  },
				),
			}));
		},
		addFile: (file) => {
			console.log('[data.addFile]', file);
			update(($ui) => ({
				...$ui,
				filesBySpace: {
					...$ui.filesBySpace,
					[file.space_id]: ($ui.filesBySpace[file.space_id] || []).concat(file),
				},
			}));
		},
		setFiles: (space_id, files) => {
			console.log('[data.setFiles]', files);
			update(($ui) => ({
				...$ui,
				filesBySpace: {
					...$ui.filesBySpace,
					[space_id]: files,
				},
			}));
		},
		findPersonaById: (persona_id: number): Readable<Persona> => {
			const persona = get(personasById).get(persona_id);
			if (!persona) throw Error(`Unknown persona ${persona_id}`);
			return persona;
		},

		// derived state
		selectedPersonaId,
		selectedPersona,
		selectedCommunity,
		selectedSpace,
		communitiesByPersonaId,
		// methods
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

const toDefaultUiState = (session: ClientSession): UiState => {
	const {guest} = session;
	return {
		communities: guest ? [] : session.communities,
		memberships: guest ? [] : [], // TODO should be on session
		spaces: guest ? [] : session.communities.flatMap((community) => community.spaces), // TODO return flat from server
		filesBySpace: {},
		selectedPersonaId: null,
		selectedCommunityId: null,
		selectedCommunityIdByPersona: {},
		selectedSpaceIdByCommunity: {},
		expandMainNav: true,
		expandSecondaryNav: true, // TODO default to `false` for mobile -- how?
		mainNavView: 'explorer',
	};
};

export type MainNavView = 'explorer' | 'account';
