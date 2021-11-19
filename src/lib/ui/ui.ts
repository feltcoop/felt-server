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
import type {DispatchContext} from '$lib/ui/api';
import type {UiHandlers} from '$lib/app/eventTypes';

const UNKNOWN_API_ERROR =
	'Something went wrong. Maybe the server or your Internet connection is down. Please try again.';

// TODO this is defined a second time as `SetMainNavViewParams`,
// but it should probably be defined separately as `MainNavView` and then referenced
export type MainNavView = 'explorer' | 'account';

const KEY = Symbol();

export const getUi = (): Ui => getContext(KEY);

export const setUi = (store: Ui): Ui => {
	setContext(KEY, store);
	return store;
};

export interface Ui extends Partial<UiHandlers> {
	dispatch: (ctx: DispatchContext) => any; // TODO return value type?

	// db state and caches
	account: Readable<AccountModel | null>;
	personas: Readable<Readable<Persona>[]>;
	personasById: Map<number, Readable<Persona>>;
	sessionPersonas: Readable<Readable<Persona>[]>;
	sessionPersonaIndices: Readable<Map<Readable<Persona>, number>>;
	communities: Readable<Readable<Community>[]>;
	spaces: Readable<Readable<Space>[]>;
	spacesById: Readable<Map<number, Readable<Space>>>;
	spacesByCommunityId: Readable<Map<number, Readable<Space>[]>>;
	memberships: Readable<Membership[]>; // TODO if no properties can change, then it shouldn't be a store? do we want to handle `null` for deletes?
	filesBySpace: Map<number, Readable<Readable<File>[]>>;
	setSession: (session: ClientSession) => void;
	findPersonaById: (persona_id: number) => Readable<Persona>;
	findSpaceById: (space_id: number) => Readable<Space>;
	// view state
	expandMainNav: Readable<boolean>;
	expandMarquee: Readable<boolean>; // TODO name?
	mainNavView: Readable<MainNavView>;
	// derived state
	selectedPersonaId: Readable<number | null>;
	selectedPersona: Readable<Readable<Persona> | null>;
	selectedPersonaIndex: Readable<number | null>;
	selectedCommunityIdByPersona: Readable<{[key: number]: number}>;
	selectedCommunityId: Readable<number | null>;
	selectedCommunity: Readable<Readable<Community> | null>;
	selectedSpaceIdByCommunity: Readable<{[key: number]: number | null}>;
	// TODO selectedSpace: Readable<Readable<Space> | null>;
	selectedSpace: Readable<Readable<Space> | null>;
	communitiesByPersonaId: Readable<{[persona_id: number]: Readable<Community>[]}>; // TODO or name `personaCommunities`?
	mobile: Readable<boolean>;
}

export const toUi = (session: Writable<ClientSession>, initialMobile: boolean): Ui => {
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
	const personasById: Map<number, Writable<Persona>> = new Map(
		get(personas).map((persona) => [get(persona).persona_id, persona]),
	);
	// not derived from session because the session has only the initial snapshot
	// TODO these `Persona`s need additional data compared to every other `Persona`
	const sessionPersonas = writable<Writable<Persona>[]>(
		initialSession.guest ? [] : initialSession.personas.map((p) => personasById.get(p.persona_id)!),
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

	const mobile = writable(initialMobile);

	// derived state
	// TODO speed up these lookups with id maps
	// TODO remove it from `state`
	const selectedPersonaId = writable<number | null>(null);
	const selectedPersona = derived(
		[selectedPersonaId],
		([$selectedPersonaId]) => ($selectedPersonaId && personasById.get($selectedPersonaId)) || null,
	);
	const selectedPersonaIndex = derived(
		[selectedPersona, sessionPersonas],
		([$selectedPersona, $sessionPersonas]) =>
			$selectedPersona === null ? null : $sessionPersonas.indexOf($selectedPersona),
	);
	const sessionPersonaIndices = derived(
		[sessionPersonas],
		([$sessionPersonas]) => new Map($sessionPersonas.map((p, i) => [p, i])),
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

	const expandMainNav = writable(!initialMobile);
	const expandMarquee = writable(!initialMobile);
	const mainNavView: Writable<MainNavView> = writable('explorer');

	const addCommunity = (community: Community, persona_id: number): void => {
		const persona = personasById.get(persona_id)!;
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
	};

	const ui: Ui = {
		account,
		personas,
		sessionPersonas,
		sessionPersonaIndices,
		spaces,
		communities,
		memberships,
		personasById,
		spacesById,
		spacesByCommunityId,
		filesBySpace,
		dispatch: (ctx) => {
			const handler = (ui as any)[ctx.eventName];
			// const handler = handlers.get(eventName); // TODO ? would make it easy to do external registration
			if (handler) {
				return handler(ctx);
			} else {
				console.warn('[ui] ignoring a dispatched event', ctx);
			}
		},
		ping: async ({invoke}) => invoke(),
		// TODO convert to a service (and use `invoke` instead of `fetch`)
		log_in: async ({params}) => {
			console.log('[log_in] logging in as', params.accountName); // TODO logging
			try {
				const response = await fetch('/api/v1/login', {
					method: 'POST',
					headers: {'content-type': 'application/json'},
					body: JSON.stringify(params),
				});
				const responseData = await response.json();
				if (response.ok) {
					console.log('[log_in] responseData', responseData); // TODO logging
					session.set(responseData.session);
					return {ok: true, status: response.status, value: responseData}; // TODO doesn't this have other status codes?
				} else {
					console.error('[log_in] response not ok', responseData, response); // TODO logging
					return {ok: false, status: response.status, reason: responseData.reason};
				}
			} catch (err) {
				console.error('[log_in] error', err); // TODO logging
				return {
					ok: false,
					status: 500,
					reason: UNKNOWN_API_ERROR,
				};
			}
		},
		// TODO convert to a service (and use `invoke` instead of `fetch`)
		log_out: async () => {
			try {
				console.log('[log_out] logging out'); // TODO logging
				const response = await fetch('/api/v1/logout', {
					method: 'POST',
					headers: {'content-type': 'application/json'},
				});
				const responseData = await response.json();
				console.log('[log_out] response', responseData); // TODO logging
				if (response.ok) {
					session.set({guest: true});
					return {ok: true, status: response.status, value: responseData};
				} else {
					console.error('[log_out] response not ok', response); // TODO logging
					return {ok: false, status: response.status, reason: responseData.reason};
				}
			} catch (err) {
				console.error('[log_out] err', err); // TODO logging
				return {
					ok: false,
					status: 500,
					reason: UNKNOWN_API_ERROR,
				};
			}
		},
		setSession: (session) => {
			console.log('[data.setSession]', session);
			// TODO these are duplicative and error prone, how to improve? helpers? recreate `ui`?
			account.set(session.guest ? null : session.account);
			personas.set(session.guest ? [] : toInitialPersonas(session).map((p) => writable(p)));
			personasById.clear();
			get(personas).forEach((persona) => personasById.set(get(persona).persona_id, persona));
			sessionPersonas.set(
				session.guest ? [] : session.personas.map((p) => personasById.get(p.persona_id)!),
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
		create_persona: async ({invoke, dispatch}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {persona, community} = result.value;
			console.log('[ui.create_persona]', persona);
			const personaStore = writable(persona);
			personas.update(($personas) => $personas.concat(personaStore));
			personasById.set(persona.persona_id, personaStore);
			sessionPersonas.update(($sessionPersonas) => $sessionPersonas.concat(personaStore));
			dispatch('select_persona', {persona_id: persona.persona_id});
			addCommunity(community as Community, persona.persona_id); // TODO fix type mismatch
			dispatch('select_community', {community_id: community.community_id});
			return result;
		},
		create_community: async ({params, invoke, dispatch}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {persona_id} = params;
			const community = result.value.community as Community; // TODO fix type mismatch
			console.log('[ui.create_community]', community, persona_id);
			// TODO how should `persona.community_ids` be modeled and kept up to date?
			addCommunity(community, persona_id);
			dispatch('select_community', {community_id: community.community_id});
			return result;
		},
		create_membership: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {membership} = result.value;
			console.log('[ui.create_membership]', membership);
			// TODO also update `communities.personas`
			memberships.update(($memberships) => $memberships.concat(membership));
			return result;
		},
		create_space: async ({params, invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {space} = result.value;
			const {community_id} = params;
			console.log('[ui.create_space]', space);
			const community = get(communities).find((c) => get(c).community_id === community_id)!;
			community.update(($community) => ({
				...$community,
				// TODO `community.spaces` is not reactive, and should be replaced with flat data structures,
				// but we may want to make them readable stores in the meantime
				spaces: $community.spaces.concat(space), // TODO should this check if it's already there? yes but for different data structures
			}));
			spaces.update(($spaces) => $spaces.concat(writable(space)));
			return result;
		},
		create_file: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {file} = result.value;
			console.log('[ui.create_file]', file);
			const fileStore = writable(file);
			const files = filesBySpace.get(file.space_id);
			if (files) {
				// TODO check if it already exists -- maybe by getting `fileStore` from a `fileById` map
				files.update(($files) => $files.concat(fileStore));
			} else {
				filesBySpace.set(file.space_id, writable([fileStore]));
			}
			return result;
		},
		read_files: async ({params, invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {space_id} = params;
			const existingFiles = filesBySpace.get(space_id);
			// TODO probably check to make sure they don't already exist
			const newFiles = result ? result.value.files.map((f) => writable(f)) : [];
			console.log('[ui.read_files]', newFiles);
			if (existingFiles) {
				existingFiles.set(newFiles);
			} else {
				filesBySpace.set(space_id, writable(newFiles));
			}
			return result;
		},
		query_files: ({params, dispatch}) => {
			let files = filesBySpace.get(params.space_id);
			if (!files) {
				filesBySpace.set(params.space_id, (files = writable([])));
				dispatch('read_files', params);
			}
			return files;
		},
		findPersonaById: (persona_id: number): Readable<Persona> => {
			const persona = personasById.get(persona_id);
			if (!persona) throw Error(`Unknown persona ${persona_id}`);
			return persona;
		},
		findSpaceById: (space_id: number): Readable<Space> => {
			const space = get(spacesById).get(space_id);
			if (!space) throw Error(`Unknown space ${space_id}`);
			return space;
		},
		// view state
		mobile,
		expandMainNav,
		expandMarquee,
		mainNavView,
		// derived state
		selectedPersonaId,
		selectedPersona,
		selectedPersonaIndex,
		selectedCommunityIdByPersona,
		selectedCommunityId,
		selectedCommunity,
		selectedSpaceIdByCommunity,
		selectedSpace,
		communitiesByPersonaId,
		// methods
		set_mobile: ({params}) => {
			mobile.set(params);
		},
		select_persona: ({params}) => {
			console.log('[ui.select_persona] persona_id', params.persona_id);
			selectedPersonaId.set(params.persona_id);
		},
		select_community: ({params}) => {
			console.log('[ui.select_community] community_id', params.community_id);
			const $selectedPersonaId = get(selectedPersonaId); // TODO how to remove the `!`?
			const {community_id} = params;
			if (community_id && $selectedPersonaId) {
				selectedCommunityIdByPersona.update(($selectedCommunityIdByPersona) => ({
					...$selectedCommunityIdByPersona,
					[$selectedPersonaId]: community_id,
				}));
			}
		},
		select_space: ({params}) => {
			console.log('[ui.select_space] community_id, space_id', params);
			const {community_id, space_id} = params;
			selectedSpaceIdByCommunity.update(($selectedSpaceIdByCommunity) => ({
				...$selectedSpaceIdByCommunity,
				[community_id]: space_id,
			}));
		},
		toggle_main_nav: () => {
			expandMainNav.update(($expandMainNav) => !$expandMainNav);
		},
		toggle_secondary_nav: () => {
			expandMarquee.update(($expandMarquee) => !$expandMarquee);
		},
		set_main_nav_view: ({params}) => {
			mainNavView.set(params);
		},
	};
	return ui;
};

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
