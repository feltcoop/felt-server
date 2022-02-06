import {writable, derived, get, type Readable, type Writable} from 'svelte/store';
import {setContext, getContext, type SvelteComponent} from 'svelte';
import {goto} from '$app/navigation';
import {mutable, type Mutable} from '@feltcoop/svelte-mutable-store';
import {type DialogData} from '@feltcoop/felt/ui/dialog/dialog.js';
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
import {type ViewData} from '$lib/vocab/view/view';

const KEY = Symbol();

export const getUi = (): Ui => getContext(KEY);

export const setUi = (store: Ui): Ui => {
	setContext(KEY, store);
	return store;
};

export interface Ui extends Partial<UiHandlers> {
	destroy: () => void;
	dispatch: (ctx: DispatchContext) => any; // TODO return value type?

	// TODO instead of eagerly loading these components,
	// this should be an interface to lazy-load UI components
	components: {[key: string]: typeof SvelteComponent};

	// db state and caches
	account: Readable<AccountModel | null>;
	personas: Readable<Readable<Persona>[]>;
	sessionPersonas: Readable<Readable<Persona>[]>;
	sessionPersonaIndices: Readable<Map<Readable<Persona>, number>>;
	communities: Readable<Readable<Community>[]>;
	spaces: Readable<Readable<Space>[]>;
	memberships: Readable<Readable<Membership>[]>;
	personaById: Map<number, Readable<Persona>>;
	communityById: Map<number, Readable<Community>>;
	spaceById: Readable<Map<number, Readable<Space>>>;
	//TODO maybe refactor to remove store around map? Like personaById
	spacesByCommunityId: Readable<Map<number, Readable<Space>[]>>;
	personasByCommunityId: Readable<Map<number, Readable<Persona>[]>>;
	entitiesBySpace: Map<number, Readable<Readable<Entity>[]>>;
	setSession: ($session: ClientSession) => void;
	// view state
	expandMainNav: Readable<boolean>;
	expandMarquee: Readable<boolean>; // TODO name?
	// derived state
	personaIdSelection: Readable<number | null>;
	personaSelection: Readable<Readable<Persona> | null>;
	personaIndexSelection: Readable<number | null>;
	communitiesBySessionPersona: Readable<Map<Readable<Persona>, Readable<Community>[]>>;
	communityIdSelectionByPersonaId: Readable<{[key: number]: number}>;
	communityIdSelection: Readable<number | null>;
	communitySelection: Readable<Readable<Community> | null>;
	spaceIdSelectionByCommunityId: Readable<{[key: number]: number | null}>;
	spaceSelection: Readable<Readable<Space> | null>;
	mobile: Readable<boolean>;
	contextmenu: ContextmenuStore;
	dialogs: Writable<DialogData[]>;
	viewBySpace: Mutable<WeakMap<Readable<Space>, ViewData>>; // client overrides for the views set by the community
}

export const toUi = (
	session: Writable<ClientSession>,
	initialMobile: boolean,
	components: {[key: string]: typeof SvelteComponent},
): Ui => {
	// Could then put these calculations in one place.
	const account = writable<AccountModel | null>(null);
	// Importantly, this only changes when items are added or removed from the collection,
	// not when the items themselves change; each item is a store that can be subscribed to.
	const personas = writable<Writable<Persona>[]>([]);
	// not derived from session because the session has only the initial snapshot
	// TODO these `Persona`s need additional data compared to every other `Persona`
	const sessionPersonas = writable<Writable<Persona>[]>([]);
	const communities = writable<Writable<Community>[]>([]);
	const spaces = writable<Writable<Space>[]>([]);
	const memberships = writable<Writable<Membership>[]>([]);
	const personaById: Map<number, Writable<Persona>> = new Map();
	const communityById: Map<number, Writable<Community>> = new Map();
	// TODO do these maps more efficiently
	const spaceById: Readable<Map<number, Writable<Space>>> = derived(
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
						communityPersonas.push(personaById.get(get(membership).persona_id)!);
					}
				}
				map.set(community_id, communityPersonas);
			}
			return map;
		},
	);

	const mobile = writable(initialMobile);
	const contextmenu = createContextmenuStore();
	const dialogs = writable<DialogData[]>([]);
	const viewBySpace = mutable(new WeakMap());

	// derived state
	// TODO speed up these lookups with id maps
	// TODO remove it from `state`
	const personaIdSelection = writable<number | null>(null);
	const personaSelection = derived(
		[personaIdSelection],
		([$personaIdSelection]) =>
			($personaIdSelection && personaById.get($personaIdSelection)) || null,
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
	const communityIdSelectionByPersonaId = writable<{[key: number]: number}>({});
	const communityIdSelection = derived(
		[personaIdSelection, communityIdSelectionByPersonaId],
		([$personaIdSelection, $communityIdSelectionByPersonaId]) =>
			$personaIdSelection && $communityIdSelectionByPersonaId[$personaIdSelection],
	);
	const communitySelection = derived([communityIdSelection], ([$communityIdSelection]) =>
		$communityIdSelection === null ? null : communityById.get($communityIdSelection)!,
	);
	// TODO consider making this the space store so we don't have to chase id references
	const spaceIdSelectionByCommunityId = writable<{[key: number]: number | null}>({});
	const spaceSelection = derived(
		[communitySelection, spaceIdSelectionByCommunityId],
		([$communitySelection, $spaceIdSelectionByCommunityId]) =>
			($communitySelection &&
				get(spaceById).get(
					$spaceIdSelectionByCommunityId[get($communitySelection)!.community_id]!,
				)) ||
			null,
	);
	// TODO this does not have an outer `Writable` -- do we want that much reactivity?
	const entitiesBySpace: Map<number, Writable<Writable<Entity>[]>> = new Map();

	const expandMainNav = writable(!initialMobile);
	const expandMarquee = writable(!initialMobile);

	const addCommunity = (
		$community: Community,
		persona_id: number,
		$communitySpaces: Space[],
	): void => {
		//TODO return membership object from server to put in here instead
		memberships.update(($memberships) =>
			$memberships.concat(
				writable({community_id: $community.community_id, persona_id} as Membership),
			),
		);

		// TODO what's the right order of updating `communities` and `spaces`?
		// We may get circular derived dependencies that put things in a bad state if either one is
		// updated first, in which case we may need something like deferred store transaction updates.

		const $spaceById = get(spaceById);
		let $spacesToAdd: Space[] | null = null;
		for (const $space of $communitySpaces) {
			if (!$spaceById.has($space.space_id)) {
				($spacesToAdd || ($spacesToAdd = [])).push($space);
			}
		}
		if ($spacesToAdd) {
			spaces.update(($spaces) => $spaces.concat($spacesToAdd!.map((s) => writable(s))));
		}
		spaceIdSelectionByCommunityId.update(($v) => ({
			...$v,
			[$community.community_id]: $communitySpaces[0].space_id,
		}));
		const community = writable($community);
		// TODO this updates the map before the store array because it may be derived,
		// but is the better implementation to use a `mutable` wrapping a map, no array?
		communityById.set($community.community_id, community);
		communities.update(($communities) => $communities.concat(community));
	};

	const ui: Ui = {
		// db data
		components,
		account,
		personas,
		sessionPersonas,
		sessionPersonaIndices,
		spaces,
		communities,
		memberships,
		personaById,
		communityById,
		spaceById,
		spacesByCommunityId,
		personasByCommunityId,
		entitiesBySpace,
		communitiesBySessionPersona,
		// view state
		mobile,
		expandMainNav,
		expandMarquee,
		contextmenu,
		dialogs,
		viewBySpace,
		personaIdSelection,
		personaSelection,
		personaIndexSelection,
		communityIdSelectionByPersonaId,
		communityIdSelection,
		communitySelection,
		spaceIdSelectionByCommunityId,
		spaceSelection,
		destroy: () => {
			unsubscribeSession();
		},
		dispatch: (ctx) => {
			const handler = (ui as any)[ctx.eventName];
			// const handler = handlers.get(eventName); // TODO ? would make it easy to do external registration
			if (handler) {
				return handler(ctx);
			} else {
				console.warn('[ui] ignoring unhandled event', ctx);
			}
		},
		setSession: ($session) => {
			if (browser) console.log('[ui.setSession]', $session);
			account.set($session.guest ? null : $session.account);

			const $personasArray = $session.guest ? [] : toInitialPersonas($session);
			const $personas = $personasArray.map((p) => writable(p));
			personaById.clear();
			$personas.forEach((p, i) => personaById.set($personasArray[i].persona_id, p));
			personas.set($personas);

			const $sessionPersonas = $session.guest ? [] : $session.personas;
			sessionPersonas.set($sessionPersonas.map((p) => personaById.get(p.persona_id)!));

			const $communitiesArray = $session.guest ? [] : $session.communities;
			const $communities = $communitiesArray.map((p) => writable(p));
			communityById.clear();
			$communities.forEach((c, i) => communityById.set($communitiesArray[i].community_id, c));
			communities.set($communities);

			spaces.set($session.guest ? [] : $session.spaces.map((s) => writable(s)));
			memberships.set($session.guest ? [] : $session.memberships.map((s) => writable(s)));

			// TODO fix this and the 2 below to use the URL to initialize the correct persona+community+space
			const $firstSessionPersona = $session.guest ? null : $sessionPersonas[0];
			personaIdSelection.set($firstSessionPersona?.persona_id ?? null);

			// TODO these two selections are hacky because using the derived stores
			// was causing various confusing issues, so they find stuff directly on the session objects
			// instead of using derived stores like `sessionPersonas` and `spacesByCommunityId`.
			communityIdSelectionByPersonaId.set(
				$session.guest
					? {}
					: Object.fromEntries(
							$sessionPersonas
								.map(($persona) => {
									const $firstMembership = $session.memberships.find(
										(m) => m.persona_id === $persona.persona_id,
									);
									const $firstCommunity = $session.communities.find(
										(c) => c.community_id === $firstMembership?.community_id,
									)!;
									return [$persona.persona_id, $firstCommunity.community_id];
								})
								.filter(Boolean),
					  ),
			);
			spaceIdSelectionByCommunityId.set(
				$session.guest
					? {}
					: Object.fromEntries(
							$session.communities
								.map(($community) => {
									const $firstSpace = $session.spaces.find(
										(s) => s.community_id === $community.community_id,
									)!;
									return [$community.community_id, $firstSpace.space_id];
								})
								.filter(Boolean),
					  ),
			);
		},
		Ping: ({invoke}) => invoke(),
		LoginAccount: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			session.set(result.value.session);
			return result;
		},
		LogoutAccount: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			session.set({guest: true});
			return result;
		},
		CreatePersona: async ({invoke, dispatch}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {persona: $persona, community: $community, spaces: $spaces} = result.value;
			console.log('[ui.CreatePersona]', $persona, $community, $spaces);
			const persona = writable($persona);
			// TODO this updates the map before the store array because it may be derived,
			// but is the better implementation to use a `mutable` wrapping a map, no array?
			personaById.set($persona.persona_id, persona);
			personas.update(($personas) => $personas.concat(persona));
			sessionPersonas.update(($sessionPersonas) => $sessionPersonas.concat(persona));
			dispatch('SelectPersona', {persona_id: $persona.persona_id});
			addCommunity($community, $persona.persona_id, $spaces);
			dispatch('SelectCommunity', {community_id: $community.community_id});
			return result;
		},
		CreateCommunity: async ({params, invoke, dispatch}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {persona_id} = params;
			const {community: $community, spaces: $spaces} = result.value;
			console.log('[ui.CreateCommunity]', $community, persona_id);
			addCommunity($community, persona_id, $spaces);
			dispatch('SelectCommunity', {community_id: $community.community_id});
			return result;
		},
		UpdateCommunitySettings: async ({params, invoke}) => {
			// optimistic update
			const community = communityById.get(params.community_id)!;
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
			const {membership: $membership} = result.value;
			console.log('[ui.CreateMembership]', $membership);
			// TODO also update `communities.personas`
			memberships.update(($memberships) => $memberships.concat(writable($membership)));
			return result;
		},
		DeleteMembership: async ({params, invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
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
			const {space: $space} = result.value;
			console.log('[ui.CreateSpace]', $space);
			spaces.update(($spaces) => $spaces.concat(writable($space)));
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
				// TODO this should only nav for the active community, otherwise update just update the spaceIdSelectionByCommunityId
				if (space_id === get(spaceIdSelectionByCommunityId)[$community.community_id]) {
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
			const {entity: $entity} = result.value;
			console.log('[ui.CreateEntity]', $entity);
			const entity = writable($entity);
			const entities = entitiesBySpace.get($entity.space_id);
			if (entities) {
				// TODO check if it already exists -- maybe by getting `entityStore` from a `entityById` map
				entities.update(($entities) => $entities.concat(entity));
			} else {
				entitiesBySpace.set($entity.space_id, writable([entity]));
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
			personaIdSelection.set(params.persona_id);
		},
		SelectCommunity: ({params}) => {
			const $personaIdSelection = get(personaIdSelection); // TODO how to remove the `!`?
			const {community_id} = params;
			if (community_id && $personaIdSelection) {
				communityIdSelectionByPersonaId.update(($communityIdSelectionByPersonaId) => ({
					...$communityIdSelectionByPersonaId,
					[$personaIdSelection]: community_id,
				}));
			}
		},
		SelectSpace: ({params}) => {
			const {community_id, space_id} = params;
			spaceIdSelectionByCommunityId.update(($spaceIdSelectionByCommunityId) => ({
				...$spaceIdSelectionByCommunityId,
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
				$space.space_id !== get(spaceIdSelectionByCommunityId)[get(selectedCommunity).community_id]
			) {
				const $community = get(communityById.get($space.community_id)!);
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

	const unsubscribeSession = session.subscribe(($session) => {
		ui.setSession($session);
	});

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
