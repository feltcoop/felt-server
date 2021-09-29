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

const KEY = Symbol();

export const getUi = (): Ui => getContext(KEY);

export const setUi = (store: Ui): Ui => {
	setContext(KEY, store);
	return store;
};

export interface Ui {
	// TODO single code path for UI actions:
	// dispatch('setSession', {session: ClientSession});

	// db state and caches
	account: Readable<AccountModel | null>;
	personas: Readable<Readable<Persona>[]>;
	personasById: Readable<Map<number, Readable<Persona>>>;
	sessionPersonas: Readable<Readable<Persona>[]>;
	communities: Readable<Readable<Community>[]>;
	spaces: Readable<Readable<Space>[]>;
	spacesById: Readable<Map<number, Readable<Space>>>;
	spacesByCommunityId: Readable<Map<number, Readable<Space>[]>>;
	memberships: Readable<Membership[]>; // TODO if no properties can change, then it shouldn't be a store? do we want to handle `null` for deletes?
	filesBySpace: Map<number, Readable<Readable<File>[]>>;
	setSession: (session: ClientSession) => void;
	addPersona: (persona: Persona) => void;
	addCommunity: (community: Community, persona_id: number) => void;
	addMembership: (membership: Membership) => void;
	addSpace: (space: Space, community_id: number) => void;
	addFile: (file: File) => void;
	setFiles: (space_id: number, files: File[]) => void;
	findPersonaById: (persona_id: number) => Readable<Persona>;
	findSpaceById: (space_id: number) => Readable<Space>;
	// view state
	expandMainNav: Readable<boolean>;
	expandMarquee: Readable<boolean>; // TODO name?
	mainNavView: Readable<MainNavView>;
	// derived state
	selectedPersonaId: Readable<number | null>;
	selectedPersona: Readable<Readable<Persona> | null>;
	selectedCommunityIdByPersona: Readable<{[key: number]: number}>;
	selectedCommunityId: Readable<number | null>;
	selectedCommunity: Readable<Readable<Community> | null>;
	selectedSpaceIdByCommunity: Readable<{[key: number]: number | null}>;
	// TODO selectedSpace: Readable<Readable<Space> | null>;
	selectedSpace: Readable<Readable<Space> | null>;
	communitiesByPersonaId: Readable<{[persona_id: number]: Readable<Community>[]}>; // TODO or name `personaCommunities`?
	mobile: Readable<boolean>;
	setMobile: (mobile: boolean) => void;
	// view methods
	selectPersona: (persona_id: number) => void;
	selectCommunity: (community_id: number | null) => void;
	selectSpace: (community_id: number, space_id: number | null) => void;
	toggleMainNav: () => void;
	toggleSecondaryNav: () => void;
	setMainNavView: (value: MainNavView) => void;
}

export const toUi = (session: Readable<ClientSession>, mobile: boolean): Ui => {
	const initialSession = get(session);

	// TODO would it helpfully simplify things to put these stores on the actual store state?
	// Could then put these calculations in one place.
	const account = writable<AccountModel | null>(
		initialSession.guest ? null : initialSession.account, // TODO shared helper with the session updater?
	);
	// Importantly, this only changes when items are added or removed from the collection,
	// not when the items themselves change; each item is a store that can be subscribed to.
	const personas = writable<Writable<Persona>[]>(
		initialSession.guest ? [] : toInitialPersonas(initialSession).map((p) => writable(p)),
	);
	// TODO do these maps more efficiently
	const personasById: Readable<Map<number, Writable<Persona>>> = derived(
		personas,
		($personas) => new Map($personas.map((persona) => [get(persona).persona_id, persona])),
	);
	// not derived from session because the session has only the initial snapshot
	// TODO these `Persona`s need additional data compared to every other `Persona`
	const sessionPersonas = writable<Writable<Persona>[]>(
		initialSession.guest
			? []
			: initialSession.personas.map((p) => get(personasById).get(p.persona_id)!),
	);
	const communities = writable<Writable<Community>[]>(
		initialSession.guest ? [] : initialSession.communities.map((p) => writable(p)),
	);
	const spaces = writable<Writable<Space>[]>(
		initialSession.guest
			? []
			: initialSession.communities.flatMap((community) => community.spaces).map((s) => writable(s)),
	);
	// TODO do these maps more efficiently
	const spacesById: Readable<Map<number, Writable<Space>>> = derived(
		spaces,
		($spaces) => new Map($spaces.map((space) => [get(space).space_id, space])),
	);
	const spacesByCommunityId: Readable<Map<number, Readable<Space>[]>> = derived(
		[communities, spacesById],
		([$communites, $spacesById]) => {
			const map = new Map();
			for (const community of $communites) {
				const spaces: Writable<Space>[] = [];
				for (const $space of get(community).spaces) {
					const space = $spacesById.get($space.space_id);
					spaces.push(space!);
				}
				map.set(get(community).community_id, spaces);
			}
			return map;
		},
	);
	const memberships = writable<Membership[]>([]); // TODO should be on the session:  initialSession.guest ? [] : [],

	const {subscribe: subscribeMobile, set: setMobile} = writable(mobile);

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
	// TODO this should store the selected space by community+persona,
	// possibly alongside additional UI state, maybe in a store or namespace of stores
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
			($selectedCommunity &&
				get(spacesById).get($selectedSpaceIdByCommunity[get($selectedCommunity)!.community_id]!)) ||
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
	// TODO this does not have an outer `Writable` -- do we want that much reactivity?
	const filesBySpace: Map<number, Writable<Writable<File>[]>> = new Map();

	const expandMainNav = writable(!mobile);
	const expandMarquee = writable(!mobile);
	const mainNavView: Writable<MainNavView> = writable('explorer');

	const ui: Ui = {
		account,
		personas,
		sessionPersonas,
		spaces,
		communities,
		memberships,
		personasById,
		spacesById,
		spacesByCommunityId,
		filesBySpace,
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
			// TODO init memberships when they're added to the session
			spaces.set(
				session.guest
					? []
					: session.communities.flatMap((community) => community.spaces).map((s) => writable(s)),
			);
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
			mainNavView.set('explorer');
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
			const $spacesById = get(spacesById);
			let spacesToAdd: Space[] | null = null;
			for (const space of community.spaces) {
				if (!$spacesById.has(space.space_id)) {
					(spacesToAdd || (spacesToAdd = [])).push(space);
				}
			}
			if (spacesToAdd) {
				spaces.update(($spaces) => $spaces.concat(spacesToAdd!.map((s) => writable(s))));
			}
			selectedSpaceIdByCommunity.update(($selectedSpaceIdByCommunity) => {
				$selectedSpaceIdByCommunity[community.community_id] = community.spaces[0].space_id;
				return $selectedSpaceIdByCommunity;
			});
			const communityStore = writable(community);
			communities.update(($communities) => $communities.concat(communityStore));
			// TODO update spaces
		},
		addMembership: (membership) => {
			console.log('[data.addMembership]', membership);
			// TODO also update `communities.personas` (which will be refactored)
			memberships.update(($memberships) => $memberships.concat(membership));
		},
		addSpace: (space, community_id) => {
			console.log('[data.addSpace]', space);
			const communityStore = get(communities).find((c) => get(c).community_id === community_id);
			communityStore?.update((community) => ({
				...community,
				// TODO `community.spaces` is not reactive, and should be replaced with flat data structures,
				// but we may want to make them readable stores in the meantime
				spaces: community.spaces.concat(space), // TODO should this check if it's already there? yes but for different data structures
			}));
			spaces.update(($spaces) => $spaces.concat(writable(space)));
		},
		addFile: (file) => {
			console.log('[data.addFile]', file);
			const fileStore = writable(file);
			const files = filesBySpace.get(file.space_id);
			if (files) {
				// TODO check if it already exists -- maybe by getting `fileStore` from a `fileById` map
				files.update(($files) => $files.concat(fileStore));
			} else {
				filesBySpace.set(file.space_id, writable([fileStore]));
			}
		},
		setFiles: (space_id, files) => {
			console.log('[data.setFiles]', files);
			const existingFiles = filesBySpace.get(space_id);
			if (existingFiles) {
				existingFiles.set(files.map((f) => writable(f)));
			} else {
				filesBySpace.set(space_id, writable(files.map((f) => writable(f))));
			}
		},
		findPersonaById: (persona_id: number): Readable<Persona> => {
			const persona = get(personasById).get(persona_id);
			if (!persona) throw Error(`Unknown persona ${persona_id}`);
			return persona;
		},
		findSpaceById: (space_id: number): Readable<Space> => {
			const space = get(spacesById).get(space_id);
			if (!space) throw Error(`Unknown space ${space_id}`);
			return space;
		},
		// view state
		mobile: {subscribe: subscribeMobile}, // don't expose the writable store
		setMobile,
		expandMainNav,
		expandMarquee,
		mainNavView,
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
			expandMainNav.update(($expandMainNav) => !$expandMainNav);
		},
		toggleSecondaryNav: () => {
			expandMarquee.update(($expandMarquee) => !$expandMarquee);
		},
		setMainNavView: (value) => {
			mainNavView.set(value);
		},
	};
	return ui;
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
