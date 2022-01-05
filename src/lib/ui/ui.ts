import type {Readable, Writable} from 'svelte/store';
import {writable, derived, get} from 'svelte/store';
import {setContext, getContext} from 'svelte';

import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {Persona} from '$lib/vocab/persona/persona';
import type {ClientSession} from '$lib/session/clientSession';
import type {AccountModel} from '$lib/vocab/account/account';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Membership} from '$lib/vocab/membership/membership';
import type {DispatchContext} from '$lib/app/dispatch';
import type {UiHandlers} from '$lib/app/eventTypes';
import type {ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
import {createContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
import type {DialogState} from '$lib/ui/dialog/dialog';

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
	entitiesBySpace: Map<number, Readable<Readable<Entity>[]>>;
	setSession: (session: ClientSession) => void;
	findPersonaById: (persona_id: number) => Readable<Persona>;
	findSpaceById: (space_id: number) => Readable<Space>;
	// view state
	expandMainNav: Readable<boolean>;
	expandMarquee: Readable<boolean>; // TODO name?
	// derived state
	personaIdSelection: Readable<number | null>;
	personaSelection: Readable<Readable<Persona> | null>;
	personaIndexSelection: Readable<number | null>;
	communityIdByPersonaSelection: Readable<{[key: number]: number}>;
	communityIdSelection: Readable<number | null>;
	communitySelection: Readable<Readable<Community> | null>;
	spaceIdByCommunitySelection: Readable<{[key: number]: number | null}>;
	spaceSelection: Readable<Readable<Space> | null>;
	communitiesByPersonaId: Readable<{[persona_id: number]: Readable<Community>[]}>; // TODO or name `personaCommunities`?
	mobile: Readable<boolean>;
	contextmenu: ContextmenuStore;
	dialogs: Writable<DialogState[]>;
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
	// TODO communitiesById
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
	const contextmenu = createContextmenuStore();
	const dialogs = writable<DialogState[]>([]);

	// derived state
	// TODO speed up these lookups with id maps
	// TODO remove it from `state`
	const personaIdSelection = writable<number | null>(null);
	const personaSelection = derived(
		[personaIdSelection],
		([$personaIdSelection]) =>
			($personaIdSelection && personasById.get($personaIdSelection)) || null,
	);
	const personaIndexSelection = derived(
		[personaSelection, sessionPersonas],
		([$personaSelection, $sessionPersonas]) =>
			$personaSelection === null ? null : $sessionPersonas.indexOf($personaSelection),
	);
	const sessionPersonaIndices = derived(
		[sessionPersonas],
		([$sessionPersonas]) => new Map($sessionPersonas.map((p, i) => [p, i])),
	);

	// TODO should these be store references instead of ids?
	// TODO maybe make this a lazy map, not a derived store?
	const communityIdByPersonaSelection = writable<{[key: number]: number}>(
		Object.fromEntries(
			get(sessionPersonas).map((persona) => {
				// TODO needs to be rethought, the `get` isn't reactive
				const $persona = get(persona);
				return [$persona.persona_id, ($persona.community_ids && $persona.community_ids[0]) ?? null];
			}),
		),
	);
	const communityIdSelection = derived(
		[personaIdSelection, communityIdByPersonaSelection],
		([$personaIdSelection, $communityIdByPersonaSelection]) =>
			$personaIdSelection && $communityIdByPersonaSelection[$personaIdSelection],
	);
	const communitySelection = derived(
		[communities, communityIdSelection],
		// TODO lookup from `communitiesById` map instead
		([$communities, $communityIdSelection]) =>
			$communities.find((c) => get(c).community_id === $communityIdSelection) || null,
	);
	// TODO this should store the selected space by community+persona,
	// possibly alongside additional UI state, maybe in a store or namespace of stores
	const spaceIdByCommunitySelection = writable<{[key: number]: number | null}>(
		initialSession.guest
			? {}
			: Object.fromEntries(
					initialSession.communities.map((community) => [
						community.community_id,
						community.spaces[0]?.space_id ?? null,
					]),
			  ),
	);
	const spaceSelection = derived(
		[communitySelection, spaceIdByCommunitySelection],
		([$communitySelection, $spaceIdByCommunitySelection]) =>
			($communitySelection &&
				get(spacesById).get(
					$spaceIdByCommunitySelection[get($communitySelection)!.community_id]!,
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
	// TODO this does not have an outer `Writable` -- do we want that much reactivity?
	const entitiesBySpace: Map<number, Writable<Writable<Entity>[]>> = new Map();

	const expandMainNav = writable(!initialMobile);
	const expandMarquee = writable(!initialMobile);

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
		spaceIdByCommunitySelection.update(($spaceIdByCommunitySelection) => {
			$spaceIdByCommunitySelection[community.community_id] = community.spaces[0].space_id;
			return $spaceIdByCommunitySelection;
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
		entitiesBySpace,
		dispatch: (ctx) => {
			const handler = (ui as any)[ctx.eventName];
			// const handler = handlers.get(eventName); // TODO ? would make it easy to do external registration
			if (handler) {
				return handler(ctx);
			} else {
				console.warn('[ui] ignoring unhandled event', ctx);
			}
		},
		Ping: async ({invoke}) => invoke(),
		// TODO convert to a service (and use `invoke` instead of `fetch`)
		LogIn: async ({params}) => {
			console.log('[LogIn] logging in as', params.accountName); // TODO logging
			try {
				const response = await fetch('/api/v1/login', {
					method: 'POST',
					headers: {'content-type': 'application/json'},
					body: JSON.stringify(params),
				});
				const responseData = await response.json();
				if (response.ok) {
					console.log('[LogIn] responseData', responseData); // TODO logging
					session.set(responseData.session);
					return {ok: true, status: response.status, value: responseData}; // TODO doesn't this have other status codes?
				} else {
					console.error('[LogIn] response not ok', responseData, response); // TODO logging
					return {ok: false, status: response.status, message: responseData.message};
				}
			} catch (err) {
				console.error('[LogIn] error', err); // TODO logging
				return {
					ok: false,
					status: 500,
					message: 'unknown error',
				};
			}
		},
		// TODO convert to a service (and use `invoke` instead of `fetch`)
		LogOut: async () => {
			try {
				console.log('[LogOut] logging out'); // TODO logging
				const response = await fetch('/api/v1/logout', {
					method: 'POST',
					headers: {'content-type': 'application/json'},
				});
				const responseData = await response.json();
				console.log('[LogOut] response', responseData); // TODO logging
				if (response.ok) {
					session.set({guest: true});
					return {ok: true, status: response.status, value: responseData};
				} else {
					console.error('[LogOut] response not ok', response); // TODO logging
					return {ok: false, status: response.status, message: responseData.message};
				}
			} catch (err) {
				console.error('[LogOut] err', err); // TODO logging
				return {
					ok: false,
					status: 500,
					message: 'unknown error',
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
				personaIdSelection.set(get(initialSessionPersona).persona_id);
			} else {
				personaIdSelection.set(null);
			}

			communities.set(session.guest ? [] : session.communities.map((p) => writable(p)));
			// TODO init memberships when they're added to the session
			spaces.set(
				session.guest
					? []
					: session.communities.flatMap((community) => community.spaces).map((s) => writable(s)),
			);
			communityIdByPersonaSelection.set(
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
			spaceIdByCommunitySelection.set(
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
		CreatePersona: async ({invoke, dispatch}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {persona, community} = result.value;
			console.log('[ui.CreatePersona]', persona);
			const personaStore = writable(persona);
			personas.update(($personas) => $personas.concat(personaStore));
			personasById.set(persona.persona_id, personaStore);
			sessionPersonas.update(($sessionPersonas) => $sessionPersonas.concat(personaStore));
			dispatch('SelectPersona', {persona_id: persona.persona_id});
			addCommunity(community as Community, persona.persona_id); // TODO fix type mismatch
			dispatch('SelectCommunity', {community_id: community.community_id});
			return result;
		},
		CreateCommunity: async ({params, invoke, dispatch}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {persona_id} = params;
			const community = result.value.community as Community; // TODO fix type mismatch
			console.log('[ui.CreateCommunity]', community, persona_id);
			// TODO how should `persona.community_ids` be modeled and kept up to date?
			addCommunity(community, persona_id);
			dispatch('SelectCommunity', {community_id: community.community_id});
			return result;
		},
		UpdateCommunitySettings: async ({params, invoke}) => {
			// optimistic update
			// TODO lookup with `communitiesById`
			const community = get(communities).find((c) => get(c).community_id === params.community_id)!;
			const originalSettings = get(community).settings;
			community.update(($community) => ({
				...$community,
				settings: {...$community.settings, ...params.settings},
			}));
			const result = await invoke();
			if (!result.ok) {
				community.update(($community) => ({...$community, settings: originalSettings}));
			}
			return result;
		},
		CreateMembership: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {membership} = result.value;
			console.log('[ui.CreateMembership]', membership);
			// TODO also update `communities.personas`
			memberships.update(($memberships) => $memberships.concat(membership));
			return result;
		},
		DeleteMembership: async ({params, invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			console.log('[ui.DeleteMembership]', params);
			// TODO also update `communities.personas`
			memberships.update(($memberships) =>
				$memberships.filter(
					(membership) =>
						membership.persona_id !== params.persona_id ||
						membership.community_id !== params.community_id,
				),
			);

			const persona = personasById.get(params.persona_id)!;
			persona.update(($persona) => ({
				...$persona,
				community_ids: $persona.community_ids.filter((c) => c !== params.community_id),
			}));

			communities.update(($communities) => {
				const community = $communities.find(
					(community) => get(community).community_id === params.community_id,
				)!;
				community.update(($community) => ({
					...$community,
					memberPersonas: $community.memberPersonas.filter(
						(p) => p.persona_id !== params.persona_id,
					),
				}));
				const empty = !get(community).memberPersonas.length;
				if (empty) {
					return $communities.filter((c) => get(c).community_id !== params.community_id);
				} else {
					return $communities;
				}
			});

			return result;
		},
		CreateSpace: async ({params, invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {space} = result.value;
			const {community_id} = params;
			console.log('[ui.CreateSpace]', space);
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
		DeleteSpace: async ({params, invoke, dispatch}) => {
			const result = await invoke();
			if (!result.ok) return result;
			//update state here
			const {space_id} = params;
			get(communities).forEach((community) => {
				community.update(($community) => ({
					...$community,
					// TODO clean this up as part of the data normalization efforts
					spaces: $community.spaces.filter((space) => space.space_id !== space_id),
				}));

				if (space_id === get(spaceIdByCommunitySelection)[get(community).community_id])
					dispatch('SelectSpace', {
						community_id: get(community).community_id,
						space_id: get(community).spaces[0].space_id,
					});
			});

			spaces.update(($spaces) => $spaces.filter((space) => get(space).space_id !== space_id));

			return result;
		},
		CreateEntity: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {entity} = result.value;
			console.log('[ui.CreateEntity]', entity);
			const entityStore = writable(entity);
			const entities = entitiesBySpace.get(entity.space_id);
			if (entities) {
				// TODO check if it already exists -- maybe by getting `entityStore` from a `entityById` map
				entities.update(($entities) => $entities.concat(entityStore));
			} else {
				entitiesBySpace.set(entity.space_id, writable([entityStore]));
			}
			return result;
		},
		ReadEntities: async ({params, invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {space_id} = params;
			const existingEntities = entitiesBySpace.get(space_id);
			// TODO probably check to make sure they don't already exist
			const newFiles = result ? result.value.entities.map((f) => writable(f)) : [];
			console.log('[ui.ReadEntities]', newFiles);
			if (existingEntities) {
				existingEntities.set(newFiles);
			} else {
				entitiesBySpace.set(space_id, writable(newFiles));
			}
			return result;
		},
		QueryEntities: ({params, dispatch}) => {
			let entities = entitiesBySpace.get(params.space_id);
			if (!entities) {
				entitiesBySpace.set(params.space_id, (entities = writable([])));
				dispatch('ReadEntities', params);
			}
			return entities;
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
		contextmenu,
		dialogs,
		// derived state
		personaIdSelection,
		personaSelection,
		personaIndexSelection,
		communityIdByPersonaSelection,
		communityIdSelection,
		communitySelection,
		spaceIdByCommunitySelection,
		spaceSelection,
		communitiesByPersonaId,
		// methods
		SetMobile: ({params}) => {
			mobile.set(params);
		},
		OpenDialog: ({params}) => {
			dialogs.update(($dialogs) => $dialogs.concat(params));
		},
		CloseDialog: () => {
			dialogs.update(($dialogs) => $dialogs.slice(0, $dialogs.length - 1));
		},
		SelectPersona: ({params}) => {
			console.log('[ui.SelectPersona] persona_id', params.persona_id);
			personaIdSelection.set(params.persona_id);
		},
		SelectCommunity: ({params}) => {
			console.log('[ui.SelectCommunity] community_id', params.community_id);
			const $personaIdSelection = get(personaIdSelection); // TODO how to remove the `!`?
			const {community_id} = params;
			if (community_id && $personaIdSelection) {
				communityIdByPersonaSelection.update(($communityIdByPersonaSelection) => ({
					...$communityIdByPersonaSelection,
					[$personaIdSelection]: community_id,
				}));
			}
		},
		SelectSpace: ({params}) => {
			console.log('[ui.SelectSpace] community_id, space_id', params);
			const {community_id, space_id} = params;
			spaceIdByCommunitySelection.update(($spaceIdByCommunitySelection) => ({
				...$spaceIdByCommunitySelection,
				[community_id]: space_id,
			}));
		},
		ToggleMainNav: () => {
			expandMainNav.update(($expandMainNav) => !$expandMainNav);
		},
		ToggleSecondaryNav: () => {
			expandMarquee.update(($expandMarquee) => !$expandMarquee);
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
