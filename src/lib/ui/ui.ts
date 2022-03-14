import {writable, derived, get, type Readable, type Writable} from 'svelte/store';
import {setContext, getContext, type SvelteComponent} from 'svelte';
import {goto} from '$app/navigation';
import {mutable, type Mutable} from '@feltcoop/svelte-mutable-store';
import {type DialogData} from '@feltcoop/felt/ui/dialog/dialog.js';
import {browser} from '$app/env';
import {Logger} from '@feltcoop/felt/util/log.js';

import {type Community} from '$lib/vocab/community/community';
import {type Space} from '$lib/vocab/space/space';
import {type Persona} from '$lib/vocab/persona/persona';
import {type ClientSession} from '$lib/session/clientSession';
import {type AccountModel} from '$lib/vocab/account/account';
import {type Entity} from '$lib/vocab/entity/entity';
import {type Membership} from '$lib/vocab/membership/membership';
import {type DispatchContext} from '$lib/app/dispatch';
import {type UiHandlers} from '$lib/app/eventTypes';
import {createContextmenuStore, type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
import {type ViewData} from '$lib/vocab/view/view';
import {initBrowser} from '$lib/ui/init';

if (browser) initBrowser();

const log = new Logger('[ui]');

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
	personas: Mutable<Array<Readable<Persona>>>;
	sessionPersonas: Readable<Array<Readable<Persona>>>;
	sessionPersonaIndices: Readable<Map<Readable<Persona>, number>>;
	communities: Mutable<Array<Readable<Community>>>;
	spaces: Mutable<Array<Readable<Space>>>;
	memberships: Mutable<Array<Readable<Membership>>>;
	personaById: Map<number, Readable<Persona>>;
	communityById: Map<number, Readable<Community>>;
	spaceById: Map<number, Readable<Space>>;
	//TODO maybe refactor to remove store around map? Like personaById
	spacesByCommunityId: Readable<Map<number, Array<Readable<Space>>>>;
	personasByCommunityId: Readable<Map<number, Array<Readable<Persona>>>>;
	entitiesBySpace: Map<number, Readable<Array<Readable<Entity>>>>; // TODO mutable inner store
	setSession: ($session: ClientSession) => void;
	// view state
	expandMainNav: Readable<boolean>;
	expandMarquee: Readable<boolean>; // TODO name?
	// derived state
	personaIdSelection: Readable<number | null>;
	personaSelection: Readable<Readable<Persona> | null>;
	personaIndexSelection: Readable<number | null>;
	communitiesBySessionPersona: Readable<Map<Readable<Persona>, Array<Readable<Community>>>>;
	communityIdSelectionByPersonaId: Readable<{[key: number]: number}>;
	communityIdSelection: Readable<number | null>;
	communitySelection: Readable<Readable<Community> | null>;
	spaceIdSelectionByCommunityId: Readable<{[key: number]: number | null}>;
	spaceSelection: Readable<Readable<Space> | null>;
	mobile: Readable<boolean>;
	layout: Writable<{width: number; height: number}>; // TODO maybe make `Readable` and update with an event? `resizeLayout`?
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
	const personas = mutable<Array<Writable<Persona>>>([]);
	// not derived from session because the session has only the initial snapshot
	// TODO these `Persona`s need additional data compared to every other `Persona`
	const sessionPersonas = writable<Array<Writable<Persona>>>([]);
	const communities = mutable<Array<Writable<Community>>>([]);
	const spaces = mutable<Array<Writable<Space>>>([]);
	const memberships = mutable<Array<Writable<Membership>>>([]);
	const personaById: Map<number, Writable<Persona>> = new Map();
	const communityById: Map<number, Writable<Community>> = new Map();
	const spaceById: Map<number, Writable<Space>> = new Map();
	// TODO do these maps more efficiently
	const spacesByCommunityId: Readable<Map<number, Array<Readable<Space>>>> = derived(
		[communities, spaces],
		([$communities, $spaces]) => {
			const map: Map<number, Array<Readable<Space>>> = new Map();
			for (const community of $communities.value) {
				const communitySpaces: Array<Writable<Space>> = [];
				const {community_id} = get(community);
				for (const space of $spaces.value) {
					if (get(space).community_id === community_id) {
						communitySpaces.push(space);
					}
				}
				map.set(community_id, communitySpaces);
			}
			return map;
		},
	);

	const personasByCommunityId: Readable<Map<number, Array<Readable<Persona>>>> = derived(
		[communities, memberships],
		([$communities, $memberships]) => {
			const map: Map<number, Array<Readable<Persona>>> = new Map();
			for (const community of $communities.value) {
				const communityPersonas: Array<Writable<Persona>> = [];
				const {community_id} = get(community);
				for (const membership of $memberships.value) {
					if (get(membership).community_id === community_id) {
						const persona = personaById.get(get(membership).persona_id)!;
						if (get(persona).type !== 'account') continue;
						communityPersonas.push(persona);
					}
				}
				map.set(community_id, communityPersonas);
			}
			return map;
		},
	);

	const mobile = writable(initialMobile);
	const layout = writable({width: 0, height: 0});
	const contextmenu = createContextmenuStore(layout);
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
	const communitiesBySessionPersona: Readable<Map<Readable<Persona>, Array<Readable<Community>>>> =
		derived(
			[sessionPersonas, memberships, communities],
			([$sessionPersonas, $memberships, $communities]) => {
				const map: Map<Readable<Persona>, Array<Readable<Community>>> = new Map();
				for (const sessionPersona of $sessionPersonas) {
					const $sessionPersona = get(sessionPersona);
					const sessionPersonaCommunities: Array<Readable<Community>> = [];
					for (const community of $communities.value) {
						const $community = get(community);
						for (const membership of $memberships.value) {
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
				spaceById.get($spaceIdSelectionByCommunityId[get($communitySelection)!.community_id]!)) ||
			null,
	);
	// TODO this does not have an outer `Writable` -- do we want that much reactivity?
	const entitiesBySpace: Map<number, Writable<Array<Writable<Entity>>>> = new Map();

	const expandMainNav = writable(!initialMobile);
	const expandMarquee = writable(!initialMobile);

	const addCommunity = (
		$community: Community,
		$communitySpaces: Space[],
		$memberships: Membership[],
	): void => {
		memberships.mutate(($ms) => $ms.push(...$memberships.map(($m) => writable($m))));

		// TODO what's the right order of updating `communities` and `spaces`?
		// We may get circular derived dependencies that put things in a bad state if either one is
		// updated first, in which case we may need something like deferred store transaction updates.

		let $spacesToAdd: Space[] | null = null;
		for (const $space of $communitySpaces) {
			if (!spaceById.has($space.space_id)) {
				($spacesToAdd || ($spacesToAdd = [])).push($space);
			}
		}
		if ($spacesToAdd) {
			const spacesToAdd = $spacesToAdd.map((s) => writable(s));
			spacesToAdd.forEach((s, i) => spaceById.set($spacesToAdd![i].space_id, s));
			spaces.mutate(($spaces) => $spaces.push(...spacesToAdd));
		}
		spaceIdSelectionByCommunityId.update(($v) => ({
			...$v,
			[$community.community_id]: $communitySpaces[0].space_id,
		}));
		const community = writable($community);
		// TODO this updates the map before the store array because it may be derived,
		// but is the better implementation to use a `mutable` wrapping a map, no array?
		communityById.set($community.community_id, community);
		communities.mutate(($communities) => $communities.push(community));
	};

	const addPersona = ($persona: Persona): void => {
		const persona = writable($persona);
		personaById.set($persona.persona_id, persona);
		personas.mutate(($personas) => $personas.push(persona));
		if ($persona.account_id)
			sessionPersonas.update(($sessionPersonas) => $sessionPersonas.concat(persona));
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
		layout,
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
			}
			log.warn('[dispatch] ignoring unhandled event', ctx);
		},
		setSession: ($session) => {
			if (browser) log.trace('[setSession]', $session);
			account.set($session.guest ? null : $session.account);

			const $personaArray = $session.guest ? [] : toInitialPersonas($session);
			const $personas = $personaArray.map((p) => writable(p));
			personaById.clear();
			$personas.forEach((p, i) => personaById.set($personaArray[i].persona_id, p));
			personas.swap($personas);

			const $sessionPersonas = $session.guest ? [] : $session.personas;
			sessionPersonas.set($sessionPersonas.map((p) => personaById.get(p.persona_id)!));

			const $communityArray = $session.guest ? [] : $session.communities;
			const $communities = $communityArray.map((p) => writable(p));
			communityById.clear();
			$communities.forEach((c, i) => communityById.set($communityArray[i].community_id, c));
			communities.swap($communities);

			const $spaceArray = $session.guest ? [] : $session.spaces;
			const $spaces = $spaceArray.map((s) => writable(s));
			spaceById.clear();
			$spaces.forEach((s, i) => spaceById.set($spaceArray[i].space_id, s));
			spaces.swap($spaces);

			memberships.swap($session.guest ? [] : $session.memberships.map((s) => writable(s)));

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
		CreateAccountPersona: async ({invoke, dispatch}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {
				persona: $persona,
				community: $community,
				spaces: $spaces,
				membership: $membership,
			} = result.value;
			log.trace('[CreatePersona]', $persona, $community, $spaces);
			addPersona($persona);
			addCommunity($community, $spaces, [$membership]);
			dispatch('SelectPersona', {persona_id: $persona.persona_id});
			dispatch('SelectCommunity', {community_id: $community.community_id});
			return result;
		},
		CreateCommunity: async ({params, invoke, dispatch}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {persona_id} = params;
			const {
				community: $community,
				spaces: $spaces,
				memberships: $memberships,
				communityPersona: $persona,
			} = result.value;
			log.trace('[ui.CreateCommunity]', $community, persona_id);
			addPersona($persona);
			addCommunity($community, $spaces, $memberships);
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
			log.trace('[CreateMembership]', $membership);
			// TODO also update `communities.personas`
			memberships.mutate(($memberships) => $memberships.push(writable($membership)));
			return result;
		},
		DeleteMembership: async ({params, invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			// TODO also update `communities.personas`
			memberships.mutate(($memberships) =>
				$memberships.splice(
					$memberships.findIndex(
						(membership) =>
							get(membership).persona_id !== params.persona_id ||
							get(membership).community_id !== params.community_id,
					),
					1,
				),
			);

			return result;
		},
		CreateSpace: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {space: $space} = result.value;
			log.trace('[CreateSpace]', $space);
			const space = writable($space);
			spaceById.set($space.space_id, space);
			spaces.mutate(($spaces) => $spaces.push(space));
			return result;
		},
		DeleteSpace: async ({params, invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			//update state here
			const {space_id} = params;
			get(communities).value.forEach((community) => {
				// TODO maybe make a nav helper or event?
				const $community = get(community);
				// TODO this should only nav for the active community, otherwise update just update the spaceIdSelectionByCommunityId
				if (space_id === get(spaceIdSelectionByCommunityId)[$community.community_id]) {
					// eslint-disable-next-line @typescript-eslint/no-floating-promises
					goto(
						'/' +
							$community.name +
							get(get(spacesByCommunityId).get($community.community_id)![0]).url +
							location.search,
						{replaceState: true},
					);
				}
			});

			const space = spaceById.get(space_id)!;
			spaceById.delete(space_id);
			spaces.mutate(($spaces) => $spaces.splice($spaces.indexOf(space), 1));

			return result;
		},
		UpdateSpace: async ({invoke, params}) => {
			const result = await invoke();
			log.trace('[UpdateSpace] result', result);
			if (!result.ok) return result;
			//TODO maybe return to $entity naming convention OR propagate this pattern?
			const {space: updatedSpace} = result.value;
			log.trace('[UpdateSpace]', updatedSpace.space_id);
			const space = spaceById.get(params.space_id);
			space!.set(updatedSpace);
			return result;
		},
		CreateEntity: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {entity: $entity} = result.value;
			log.trace('[CreateEntity]', $entity);
			const entity = writable($entity);
			const spaceEntities = entitiesBySpace.get($entity.space_id);
			if (spaceEntities) {
				// TODO check if it already exists -- maybe by getting `entityStore` from a `entityById` map
				spaceEntities.update(($entities) => $entities.concat(entity));
			} else {
				entitiesBySpace.set($entity.space_id, writable([entity]));
			}
			return result;
		},
		UpdateEntity: async ({invoke}) => {
			const result = await invoke();
			log.trace('[UpdateEnity] result', result);
			if (!result.ok) return result;
			//TODO maybe return to $entity naming convention OR propagate this pattern?
			const {entity: updatedEntity} = result.value;
			log.trace('[UpdateEntity]', updatedEntity.entity_id);
			const entities = entitiesBySpace.get(updatedEntity.space_id);
			const entity = get(entities!).find((e) => get(e).entity_id === updatedEntity.entity_id);
			entity!.set(updatedEntity);
			return result;
		},
		DeleteEntity: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			//update state here

			//TODO add store updates once new entity/tie stores are in place
			return result;
		},
		ReadEntities: async ({params, invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			const {space_id} = params;
			const existingSpaceEntities = entitiesBySpace.get(space_id);
			// TODO probably check to make sure they don't already exist
			const newFiles = result ? result.value.entities.map((f) => writable(f)) : [];
			log.trace('[ReadEntities]', newFiles);
			if (existingSpaceEntities) {
				existingSpaceEntities.set(newFiles);
			} else {
				entitiesBySpace.set(space_id, writable(newFiles));
			}
			return result;
		},
		QueryEntities: ({params, dispatch}) => {
			let spaceEntities = entitiesBySpace.get(params.space_id);
			if (!spaceEntities) {
				entitiesBySpace.set(params.space_id, (spaceEntities = writable([])));
				dispatch('ReadEntities', params); // eslint-disable-line @typescript-eslint/no-floating-promises
			}
			return spaceEntities;
		},
		CreateTie: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			//TODO figure out front end state for Ties
			return result;
		},
		ReadTies: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			log.trace('[ReadTies] result', result);
			//TODO figure out front end state for Ties
			return result;
		},
		DeleteTie: async ({invoke}) => {
			const result = await invoke();
			if (!result.ok) return result;
			log.trace('[DeleteTie] result', result);
			//TODO figure out front end state for Ties
			return result;
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
		ViewSpace: async ({params: {space, view}}) => {
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
				await goto('/' + $community.name + $space.url + location.search, {replaceState: true});
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
