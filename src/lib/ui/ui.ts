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
	memberships: Membership[]; // TODO needs to be used, currently only gets populated when a new membership is created
	spaces: Space[];
	filesBySpace: Record<number, File[]>;

	expandMainNav: boolean;
	expandSecondaryNav: boolean; // TODO name?
	mainNavView: MainNavView;
}

export interface UiStore {
	subscribe: Readable<UiState>['subscribe'];
	// TODO this is actually a writable as implemented, but with the type do we care?
	// or do we want to protect the API from being called in unexpected ways?
	account: Readable<AccountModel | null>;
	communities: Readable<Readable<Community>[]>;
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
	selectedCommunityIdByPersona: Readable<{[key: number]: number}>;
	selectedCommunityId: Readable<number | null>;
	selectedCommunity: Readable<Readable<Community> | null>;
	selectedSpaceIdByCommunity: Readable<{[key: number]: number | null}>;
	selectedSpace: Readable<Space | null>;
	communitiesByPersonaId: Readable<{[persona_id: number]: Readable<Community>[]}>; // TODO or name `personaCommunities`?
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

	// importantly, this only changes when items are added or removed from the collection,
	// not when the items themselves change; each item is a store that can be subscribed to
	const personas = writable<Writable<Persona>[]>(
		initialSession.guest ? [] : toInitialPersonas(initialSession).map((p) => writable(p)),
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
	// TODO speed up these lookups with id maps
	// TODO remove it from `state`
	const selectedPersonaId = writable<number | null>(null);
	const selectedPersona = derived(
		[selectedPersonaId, personasById],
		([$selectedPersonaId, $personasById]) =>
			($selectedPersonaId && $personasById.get($selectedPersonaId)) || null,
	);

	// TODO should these be store references instead of ids?
	// TODO maybe make this a lazy map, not a derived store?
	const selectedCommunityIdByPersona = writable<{[key: number]: number}>(
		Object.fromEntries(
			get(sessionPersonas).map((persona) => {
				// TODO needs to be rethought, the `get` isn't reactive
				const $persona = get(persona);
				return [$persona.persona_id, ($persona.community_ids && $persona.community_ids[0]) ?? null];
			}),
		),
	);
	const communities = writable<Writable<Community>[]>(
		initialSession.guest ? [] : initialSession.communities.map((p) => writable(p)),
	);
	const selectedCommunityId = derived(
		[selectedPersonaId, selectedCommunityIdByPersona],
		([$selectedPersonaId, $selectedCommunityIdByPersona]) =>
			$selectedPersonaId && $selectedCommunityIdByPersona[$selectedPersonaId],
	);
	const selectedCommunity = derived(
		[communities, selectedCommunityId],
		// TODO lookup from `communitiesById` map instead
		([$communities, $selectedCommunityId]) =>
			$communities.find((c) => get(c).community_id === $selectedCommunityId) || null,
	);
	// TODO do we care about making this reactive to new communities, or is `undefined` ok?
	const selectedSpaceIdByCommunity = writable<{[key: number]: number | null}>(
		initialSession.guest
			? {}
			: Object.fromEntries(
					initialSession.communities.map((community) => [
						community.community_id,
						community.spaces[0]?.space_id ?? null,
					]),
			  ),
	);
	const selectedSpace = derived(
		[selectedCommunity, selectedSpaceIdByCommunity],
		([$selectedCommunity, $selectedSpaceIdByCommunity]) =>
			// TODO faster lookup
			($selectedCommunity &&
				get($selectedCommunity).spaces.find(
					(s) => s.space_id === $selectedSpaceIdByCommunity[get($selectedCommunity)!.community_id],
				)) ||
			null,
	);
	const communitiesByPersonaId = derived(
		[communities, sessionPersonas],
		([$communities, $sessionPersonas]) =>
			$sessionPersonas.reduce((result, persona) => {
				// TODO refactor this to be reactive
				const $persona = get(persona);
				// TODO speed up this lookup, probably with a map of all communities by id
				result[$persona.persona_id] = $communities.filter(
					(community) =>
						// TODO why no `community_ids`?
						$persona.community_ids && $persona.community_ids.includes(get(community).community_id),
				);
				return result;
			}, {} as {[persona_id: number]: Readable<Community>[]}),
	);

	const store: UiStore = {
		subscribe,
		account,
		personas,
		personasById,
		sessionPersonas,
		communities,
		setSession: (session) => {
			console.log('[data.setSession]', session);
			// TODO these are duplicative and error prone, how to improve? helpers? recreate `ui`?
			account.set(session.guest ? null : session.account);
			personas.set(session.guest ? [] : toInitialPersonas(session).map((p) => writable(p)));
			sessionPersonas.set(
				session.guest ? [] : session.personas.map((p) => get(personasById).get(p.persona_id)!),
			);

			// TODO improve this with the other code
			const initialSessionPersona = session.guest ? null : get(sessionPersonas)[0];
			if (initialSessionPersona) {
				selectedPersonaId.set(get(initialSessionPersona).persona_id);
			} else {
				selectedPersonaId.set(null);
			}

			communities.set(session.guest ? [] : session.communities.map((p) => writable(p)));
			selectedCommunityIdByPersona.set(
				// TODO copypasta from above
				Object.fromEntries(
					get(sessionPersonas).map((persona) => {
						// TODO needs to be rethought, the `get` isn't reactive
						const $persona = get(persona);
						return [
							$persona.persona_id,
							($persona.community_ids && $persona.community_ids[0]) ?? null,
						];
					}),
				),
			);
			selectedSpaceIdByCommunity.set(
				// TODO copypasta from above
				session.guest
					? {}
					: Object.fromEntries(
							session.communities.map((community) => [
								community.community_id,
								community.spaces[0]?.space_id ?? null,
							]),
					  ),
			);
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
			// TODO how should `persona.community_ids` by modeled and kept up to date?
			const persona = get(personasById).get(persona_id)!;
			const $persona = get(persona);
			if (!$persona.community_ids.includes(community.community_id)) {
				persona.update(($persona) => ({
					...$persona,
					community_ids: $persona.community_ids.concat(community.community_id),
				}));
				console.log('updated persona community ids', get(persona));
			}
			const communityStore = writable(community);
			communities.update(($communities) => $communities.concat(communityStore));
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
			const communityStore = get(communities).find((c) => get(c).community_id === community_id);
			communityStore?.update((community) => ({
				...community,
				spaces: community.spaces.concat(space), // TODO should this check if it's already there?
			}));
			update(($ui) => ({
				...$ui,
				spaces: $ui.spaces.concat(space),
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
		selectedCommunityIdByPersona,
		selectedCommunityId,
		selectedCommunity,
		selectedSpaceIdByCommunity,
		selectedSpace,
		communitiesByPersonaId,
		// methods
		selectPersona: (persona_id) => {
			console.log('[ui.selectPersona] persona_id', {persona_id});
			selectedPersonaId.set(persona_id);
		},
		selectCommunity: (community_id) => {
			console.log('[ui.selectCommunity] community_id', {community_id});
			const $selectedPersonaId = get(selectedPersonaId); // TODO how to remove the `!`?
			if (community_id && $selectedPersonaId) {
				selectedCommunityIdByPersona.update(($selectedCommunityIdByPersona) => ({
					...$selectedCommunityIdByPersona,
					[$selectedPersonaId]: community_id,
				}));
			}
		},
		selectSpace: (community_id, space_id) => {
			console.log('[ui.selectSpace] community_id, space_id', {community_id, space_id});
			selectedSpaceIdByCommunity.update(($selectedSpaceIdByCommunity) => ({
				...$selectedSpaceIdByCommunity,
				[community_id]: space_id,
			}));
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
		memberships: guest ? [] : [], // TODO should be on session
		spaces: guest ? [] : session.communities.flatMap((community) => community.spaces), // TODO return flat from server
		filesBySpace: {},
		expandMainNav: true,
		expandSecondaryNav: true, // TODO default to `false` for mobile -- how?
		mainNavView: 'explorer',
	};
};

export type MainNavView = 'explorer' | 'account';

// TODO this is a hack until we have `community_ids` normalized and off the `Persona`,
// the issue is that the "session personas" are different than the rest of the personas
// by having their `community_ids` populated, so as a hack we prefer that instance in the global,
// but these probably need to be split into two separate collections --
// notice that comparison checks between the two types of personas will not be able to use store reference equality
const toInitialPersonas = (session: ClientSession): Persona[] =>
	session.guest
		? []
		: session.personas.concat(
				session.allPersonas.filter(
					(p1) => !session.personas.find((p2) => p2.persona_id === p1.persona_id),
				),
		  );
