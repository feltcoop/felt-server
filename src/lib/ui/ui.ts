import {writable, derived, get, type Readable, type Writable} from 'svelte/store';
import {setContext, getContext, type SvelteComponent} from 'svelte';
import {goto} from '$app/navigation';
import {mutable, type Mutable} from '@feltcoop/svelte-mutable-store';
import {browser} from '$app/env';

import {type Community} from '$lib/vocab/community/community';
import {type Space} from '$lib/vocab/space/space';
import {type Persona} from '$lib/vocab/persona/persona';
import {type ClientSession} from '$lib/session/clientSession';
import {type AccountModel} from '$lib/vocab/account/account';
import {type Entity} from '$lib/vocab/entity/entity';
import {type Membership} from '$lib/vocab/membership/membership';
import {type DispatchContext} from '$lib/app/dispatch';
import {type UiHandlers} from '$lib/app/eventTypes';
import {type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
import {createContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
import {type DialogState} from '$lib/ui/dialog/dialog';
import {type ViewData} from '$lib/vocab/view/view';

const KEY = Symbol();

export const getUi = (): Ui => getContext(KEY);

export const setUi = (store: Ui): Ui => {
	setContext(KEY, store);
	return store;
};

export interface Ui extends Partial<UiHandlers> {
	dispatch: (ctx: DispatchContext) => any; // TODO return value type?

	// TODO instead of eagerly loading these components,
	// this should be an interface to lazy-load UI components
	components: {[key: string]: typeof SvelteComponent};

	// db state and caches
	account: Readable<AccountModel | null>;
	personas: Readable<Readable<Persona>[]>;
	personasById: Map<number, Readable<Persona>>; //TODO rename to singular
	sessionPersonas: Readable<Readable<Persona>[]>;
	sessionPersonaIndices: Readable<Map<Readable<Persona>, number>>;
	communities: Readable<Readable<Community>[]>;
	spaces: Readable<Readable<Space>[]>;
	memberships: Readable<Readable<Membership>[]>;
	spacesById: Readable<Map<number, Readable<Space>>>;
	//TODO maybe refactor to remove store around map? Like personasById
	spacesByCommunityId: Readable<Map<number, Readable<Space>[]>>;
	personasByCommunityId: Readable<Map<number, Readable<Persona>[]>>;
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
	communitiesBySessionPersona: Readable<Map<Readable<Persona>, Readable<Community>[]>>;
	communityIdByPersonaSelection: Readable<{[key: number]: number}>;
	communityIdSelection: Readable<number | null>;
	communitySelection: Readable<Readable<Community> | null>;
	spaceIdByCommunitySelection: Readable<{[key: number]: number | null}>;
	spaceSelection: Readable<Readable<Space> | null>;
	mobile: Readable<boolean>;
	contextmenu: ContextmenuStore;
	dialogs: Writable<DialogState[]>;
	viewBySpace: Mutable<WeakMap<Readable<Space>, ViewData>>; // client overrides for the views set by the community
}

export const toUi = (
	session: Writable<ClientSession>,
	initialMobile: boolean,
	components: {[key: string]: typeof SvelteComponent},
): Ui => {
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
	// TODO add `communityById` and delete `getCommunity`
	const spaces = writable<Writable<Space>[]>(
		initialSession.guest ? [] : initialSession.spaces.map((s) => writable(s)),
	);
	const memberships = writable<Writable<Membership>[]>(
		initialSession.guest ? [] : initialSession.memberships.map((s) => writable(s)),
	);
	// TODO do these maps more efficiently
	const spacesById: Readable<Map<number, Writable<Space>>> = derived(
		spaces,
		($spaces) => new Map($spaces.map((space) => [get(space).space_id, space])),
	);
	const spacesByCommunityId: Readable<Map<number, Readable<Space>[]>> = derived(
		[communities, spaces],
		([$communities, $spaces]) => {
			const map: Map<number, Readable<Space>[]> = new Map();
			for (const community of $communities) {
				const communitySpaces: Writable<Space>[] = [];
				const {community_id} = get(community);
				for (const space of $spaces) {
					if (get(space).community_id === community_id) {
						communitySpaces.push(space!);
					}
				}
				map.set(community_id, communitySpaces);
			}
			return map;
		},
	);

	const personasByCommunityId: Readable<Map<number, Readable<Persona>[]>> = derived(
		[communities, memberships],
		([$communities, $memberships]) => {
			const map: Map<number, Readable<Persona>[]> = new Map();
			for (const community of $communities) {
				const communityPersonas: Writable<Persona>[] = [];
				const {community_id} = get(community);
				for (const membership of $memberships) {
					if (get(membership).community_id === community_id) {
						communityPersonas.push(personasById.get(get(membership).persona_id)!);
					}
				}
				map.set(community_id, communityPersonas);
			}
			return map;
		},
	);

	const mobile = writable(initialMobile);
	const contextmenu = createContextmenuStore();
	const dialogs = writable<DialogState[]>([]);
	const viewBySpace = mutable(new WeakMap());

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
	const communitiesBySessionPersona: Readable<Map<Readable<Persona>, Readable<Community>[]>> =
		derived(
			[sessionPersonas, memberships, communities],
			([$sessionPersonas, $memberships, $communities]) => {
				const map: Map<Readable<Persona>, Readable<Community>[]> = new Map();
				for (const sessionPersona of $sessionPersonas) {
					const $sessionPersona = get(sessionPersona);
					const sessionPersonaCommunities: Readable<Community>[] = [];
					for (const community of $communities) {
						const $community = get(community);
						for (const membership of $memberships) {
							const $membership = get(membership);
							if (
								$membership.community_id === $community.community_id &&
								$membership.persona_id === $sessionPersona.persona_id
							) {
								sessionPersonaCommunities.push(community);
								break;
							}
						}
					}

					map.set(sessionPersona, sessionPersonaCommunities);
				}
				return map;
			},
		);
	// TODO should these be store references instead of ids?
	// TODO maybe make this a lazy map, not a derived store?
	const communityIdByPersonaSelection = writable<{[key: number]: number}>(
		Object.fromEntries(
			get(sessionPersonas)
				.map((persona) => {
					// TODO needs to be rethought, the `get` isn't reactive
					const $persona = get(persona);
					const communities = get(communitiesBySessionPersona).get(persona)!;
					const firstCommunity = communities[0];
					return firstCommunity ? [$persona.persona_id, get(firstCommunity).community_id] : null!;
				})
				.filter(Boolean),
		),
	);
	const communityIdSelection = derived(
		[personaIdSelection, communityIdByPersonaSelection],
		([$personaIdSelection, $communityIdByPersonaSelection]) =>
			$personaIdSelection && $communityIdByPersonaSelection[$personaIdSelection],
	);
	const communitySelection = derived(
		[communities, communityIdSelection],
		([$communities, $communityIdSelection]) =>
			$communityIdSelection === null ? null : getCommunity($communities, $communityIdSelection),
	);
	// TODO this should store the selected space by community+persona,
	// possibly alongside additional UI state, maybe in a store or namespace of stores
	// TODO consider making this the space store so we don't have to chase id references
	const spaceIdByCommunitySelection = writable<{[key: number]: number | null}>(
		initialSession.guest
			? {}
			: Object.fromEntries(
					initialSession.communities.map((community) => [
						community.community_id,
						get(get(spacesByCommunityId).get(community.community_id)![0]).space_id ?? null,
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
	// TODO this does not have an outer `Writable` -- do we want that much reactivity?
	const entitiesBySpace: Map<number, Writable<Writable<Entity>[]>> = new Map();

	const expandMainNav = writable(!initialMobile);
	const expandMarquee = writable(!initialMobile);

	const addCommunity = (
		community: Community,
		persona_id: number,
		communitySpaces: Space[],
	): void => {
		//TODO return membership object from server to put in here instead
		memberships.update(($memberships) =>
			$memberships.concat(
				writable({community_id: community.community_id, persona_id} as Membership),
			),
		);

		const $spacesById = get(spacesById);
		let spacesToAdd: Space[] | null = null;
		for (const space of communitySpaces) {
			if (!$spacesById.has(space.space_id)) {
				(spacesToAdd || (spacesToAdd = [])).push(space);
			}
		}
		if (spacesToAdd) {
			spaces.update(($spaces) => $spaces.concat(spacesToAdd!.map((s) => writable(s))));
		}
		spaceIdByCommunitySelection.update(($spaceIdByCommunitySelection) => {
			$spaceIdByCommunitySelection[community.community_id] = communitySpaces[0].space_id;
			return $spaceIdByCommunitySelection;
		});
		const communityStore = writable(community);
		communities.update(($communities) => $communities.concat(communityStore));
	};

	const ui: Ui = {
		components,
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
		personasByCommunityId,
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
			if (browser) console.log('[ui.setSession]', session);
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
			memberships.set(session.guest ? [] : session.memberships.map((s) => writable(s)));
			communities.set(session.guest ? [] : session.communities.map((p) => writable(p)));
			spaces.set(session.guest ? [] : session.spaces.map((s) => writable(s)));
			communityIdByPersonaSelection.set(
				// TODO copypasta from above
				Object.fromEntries(
					get(sessionPersonas)
						.map((persona) => {
							// TODO needs to be rethought, the `get` isn't reactive
							const $persona = get(persona);
							const communities = get(communitiesBySessionPersona).get(persona)!;
							const firstCommunity = communities[0];
							return firstCommunity
								? [$persona.persona_id, get(firstCommunity).community_id]
								: null!;
						})
						.filter(Boolean),
				),
			);
			spaceIdByCommunitySelection.set(
				// TODO copypasta from above
				session.guest
					? {}
					: Object.fromEntries(
							session.communities.map((community) => [
								community.community_id,
								get(get(spacesByCommunityId).get(community.community_id)![0]).space_id ?? null,
							]),
					  ),
			);
		},
		CreatePersona: async ({invoke, dispatch}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {persona, community, spaces} = result.value;
			console.log('[ui.CreatePersona]', persona);
			const personaStore = writable(persona);
			personas.update(($personas) => $personas.concat(personaStore));
			personasById.set(persona.persona_id, personaStore);
			sessionPersonas.update(($sessionPersonas) => $sessionPersonas.concat(personaStore));
			dispatch('SelectPersona', {persona_id: persona.persona_id});
			addCommunity(community, persona.persona_id, spaces);
			dispatch('SelectCommunity', {community_id: community.community_id});
			return result;
		},
		CreateCommunity: async ({params, invoke, dispatch}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {persona_id} = params;
			const {community, spaces} = result.value;
			console.log('[ui.CreateCommunity]', community, persona_id);
			addCommunity(community, persona_id, spaces);
			dispatch('SelectCommunity', {community_id: community.community_id});
			return result;
		},
		UpdateCommunitySettings: async ({params, invoke}) => {
			// optimistic update
			const community = getCommunity(get(communities), params.community_id);
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
			memberships.update(($memberships) => $memberships.concat(writable(membership)));
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
						get(membership).persona_id !== params.persona_id ||
						get(membership).community_id !== params.community_id,
				),
			);

			return result;
		},
		CreateSpace: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {space} = result.value;
			console.log('[ui.CreateSpace]', space);
			spaces.update(($spaces) => $spaces.concat(writable(space)));
			return result;
		},
		DeleteSpace: async ({params, invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			//update state here
			const {space_id} = params;
			get(communities).forEach((community) => {
				// TODO maybe make a nav helper or event?
				const $community = get(community);
				// TODO this should only nav for the active community, otherwise update just update the spaceIdByCommunitySelection
				if (space_id === get(spaceIdByCommunitySelection)[$community.community_id]) {
					goto(
						'/' +
							$community.name +
							get(get(spacesByCommunityId).get($community.community_id)![0]).url +
							location.search,
						{replaceState: true},
					);
				}
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
		viewBySpace,
		// derived state
		personaIdSelection,
		personaSelection,
		personaIndexSelection,
		communitiesBySessionPersona,
		communityIdByPersonaSelection,
		communityIdSelection,
		communitySelection,
		spaceIdByCommunitySelection,
		spaceSelection,
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
		ViewSpace: ({params: {space, view}}) => {
			viewBySpace.mutate(($viewBySpace) => {
				if (view) {
					$viewBySpace.set(space, view);
				} else {
					$viewBySpace.delete(space);
				}
			});
			// Navigate the browser to the target space.
			// The target community may not match the selected community,
			// so it's not as simple as checking if this is already the selected space for its community,
			// we need to check if the selected community's selected space matches this space.
			const selectedCommunity = get(communitySelection);
			const $space = get(space);
			if (
				selectedCommunity &&
				$space.space_id !== get(spaceIdByCommunitySelection)[get(selectedCommunity).community_id]
			) {
				const $community = get(getCommunity(get(communities), $space.community_id));
				goto('/' + $community.name + $space.url + location.search, {replaceState: true});
			}
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

// TODO delete this and lookup from `communityById` map instead
export const getCommunity = (
	communities: Readable<Community>[],
	community_id: number,
): Writable<Community> =>
	// TODO typecast allows `Readable` input and `Writable` return value for usage in components,
	// but this function will be deleted soon anyway (see the comment above)
	communities.find((c) => get(c).community_id === community_id) as Writable<Community>;
