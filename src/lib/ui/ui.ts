import {
	writable,
	derived,
	type Readable,
	type Writable,
	mutable,
	type Mutable,
} from '@feltcoop/svelte-gettable-stores';
import {setContext, getContext, type SvelteComponent} from 'svelte';
import type {DialogData} from '@feltcoop/felt/ui/dialog/dialog.js';
import {browser} from '$app/env';

import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {Persona} from '$lib/vocab/persona/persona';
import type {AccountModel} from '$lib/vocab/account/account';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Membership} from '$lib/vocab/membership/membership';
import {createContextmenuStore, type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
import {initBrowser} from '$lib/ui/init';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import {locallyStored, locallyStoredMap} from '$lib/ui/locallyStored';
import type {Tie} from '$lib/vocab/tie/tie';

if (browser) initBrowser();

const KEY = Symbol();

export const getUi = (): Ui => getContext(KEY);

export const setUi = (store: Ui): Ui => {
	setContext(KEY, store);
	return store;
};

export interface Ui {
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
	entityById: Map<number, Readable<Entity>>; // TODO mutable inner store
	entitiesBySourceId: Map<number, Readable<Array<Readable<Entity>>>>; // TODO mutable inner store
	sourceTiesByDestEntityId: Mutable<Map<number, Mutable<Tie[]>>>;
	destTiesBySourceEntityId: Mutable<Map<number, Mutable<Tie[]>>>;
	// view state
	expandMainNav: Readable<boolean>;
	expandMarquee: Readable<boolean>;
	// derived state
	personaIdSelection: Readable<number | null>;
	personaSelection: Readable<Readable<Persona> | null>;
	personaIndexSelection: Readable<number | null>;
	communitiesBySessionPersona: Readable<Map<Readable<Persona>, Array<Readable<Community>>>>;
	communityIdSelectionByPersonaId: Mutable<Map<number, number | null>>;
	communitySelection: Readable<Readable<Community> | null>;
	spaceIdSelectionByCommunityId: Mutable<Map<number, number | null>>;
	spaceSelection: Readable<Readable<Space> | null>;
	lastSeenByDirectoryId: Map<number, Writable<number> | null>;
	freshnessByDirectoryId: Map<number, Readable<boolean>>;
	freshnessByCommunityId: Map<number, Writable<boolean>>;
	mobile: Readable<boolean>;
	layout: Writable<{width: number; height: number}>; // TODO maybe make `Readable` and update with an event? `resizeLayout`?
	contextmenu: ContextmenuStore;
	dialogs: Readable<DialogData[]>;
	viewBySpace: Mutable<WeakMap<Readable<Space>, string>>; // client overrides for the views set by the community
}

export type WritableUi = ReturnType<typeof toUi>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const toUi = (
	initialMobile: boolean,
	components: {[key: string]: typeof SvelteComponent},
	onError: (message: string | undefined) => void,
) => {
	const account = writable<AccountModel | null>(null);
	// Importantly, these collections only change when items are added or removed,
	// not when the items themselves change; each item is a store that can be subscribed to.
	// TODO these `Persona`s need additional data compared to every other `Persona`
	const sessionPersonas = writable<Array<Writable<Persona>>>([]);
	const personas = mutable<Array<Writable<Persona>>>([]);
	const communities = mutable<Array<Writable<Community>>>([]);
	const spaces = mutable<Array<Writable<Space>>>([]);
	const memberships = mutable<Array<Writable<Membership>>>([]);
	const personaById: Map<number, Writable<Persona>> = new Map();
	const communityById: Map<number, Writable<Community>> = new Map();
	const spaceById: Map<number, Writable<Space>> = new Map();
	// TODO do these maps more efficiently
	const spacesByCommunityId: Readable<Map<number, Array<Writable<Space>>>> = derived(
		[communities, spaces],
		([$communities, $spaces]) => {
			const map: Map<number, Array<Writable<Space>>> = new Map();
			for (const community of $communities.value) {
				const communitySpaces: Array<Writable<Space>> = [];
				const {community_id} = community.get();
				for (const space of $spaces.value) {
					if (space.get().community_id === community_id) {
						communitySpaces.push(space);
					}
				}
				communitySpaces.sort((_a, _b) => {
					const a = _a.get();
					const b = _b.get();
					return isHomeSpace(a) ? -1 : isHomeSpace(b) ? 1 : a.name < b.name ? -1 : 1;
				});
				map.set(community_id, communitySpaces);
			}
			return map;
		},
	);

	const personasByCommunityId: Readable<Map<number, Array<Writable<Persona>>>> = derived(
		[communities, memberships],
		([$communities, $memberships]) => {
			const map: Map<number, Array<Writable<Persona>>> = new Map();
			for (const community of $communities.value) {
				const communityPersonas: Array<Writable<Persona>> = [];
				const {community_id} = community.get();
				for (const membership of $memberships.value) {
					if (membership.get().community_id === community_id) {
						const persona = personaById.get(membership.get().persona_id)!;
						if (persona.get().type !== 'account') continue;
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
	const contextmenu = createContextmenuStore({layout, onError});
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
			$personaSelection ? $sessionPersonas.indexOf($personaSelection) : null,
	);
	const sessionPersonaIndices = derived(
		[sessionPersonas],
		([$sessionPersonas]) => new Map($sessionPersonas.map((p, i) => [p, i])),
	);
	const communitiesBySessionPersona: Readable<Map<Writable<Persona>, Array<Writable<Community>>>> =
		derived(
			[sessionPersonas, memberships, communities],
			([$sessionPersonas, $memberships, $communities]) => {
				const map: Map<Writable<Persona>, Array<Writable<Community>>> = new Map();
				for (const sessionPersona of $sessionPersonas) {
					const $sessionPersona = sessionPersona.get();
					const sessionPersonaCommunities: Array<Writable<Community>> = [];
					for (const community of $communities.value) {
						const $community = community.get();
						for (const membership of $memberships.value) {
							const $membership = membership.get();
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
	const communityIdSelectionByPersonaId = mutable<Map<number, number | null>>(new Map());
	const communitySelection = derived(
		[personaIdSelection, communityIdSelectionByPersonaId],
		([$personaIdSelection, $communityIdSelectionByPersonaId]) =>
			$personaIdSelection
				? communityById.get($communityIdSelectionByPersonaId.value.get($personaIdSelection)!)!
				: null,
	);
	// TODO consider making this the space store so we don't have to chase id references
	const spaceIdSelectionByCommunityId = locallyStoredMap<
		Mutable<Map<number, number | null>>,
		Map<number, number | null>,
		Array<[number, number | null]>
	>(mutable(new Map()), 'spaceIdSelectionByCommunityId');
	const spaceSelection = derived(
		[communitySelection, spaceIdSelectionByCommunityId],
		([$communitySelection, $spaceIdSelectionByCommunityId]) =>
			($communitySelection &&
				spaceById.get(
					$spaceIdSelectionByCommunityId.value.get($communitySelection.get()!.community_id)!,
				)) ||
			null,
	);
	const lastSeenByDirectoryId: Map<number, Writable<number> | null> = new Map();
	// TODO this does not have an outer `Writable` -- do we want that much reactivity?
	const entityById: Map<number, Writable<Entity>> = new Map();

	const freshnessByDirectoryId: Map<number, Readable<boolean>> = new Map();
	const freshnessByCommunityId: Map<number, Writable<boolean>> = new Map();

	const entitiesBySourceId: Map<number, Writable<Array<Writable<Entity>>>> = new Map();
	const sourceTiesByDestEntityId: Mutable<Map<number, Mutable<Tie[]>>> = mutable(new Map());
	const destTiesBySourceEntityId: Mutable<Map<number, Mutable<Tie[]>>> = mutable(new Map());

	const expandMainNav = locallyStored(writable(!initialMobile), 'expandMainNav');
	const expandMarquee = locallyStored(writable(!initialMobile), 'expandMarquee');

	return {
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
		entityById,
		entitiesBySourceId,
		sourceTiesByDestEntityId,
		destTiesBySourceEntityId,
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
		communitySelection,
		spaceIdSelectionByCommunityId,
		spaceSelection,
		lastSeenByDirectoryId,
		freshnessByDirectoryId,
		freshnessByCommunityId,
	};
};

// This ensures that the inferred `WritableUi` is assignable to `Ui`.
// The latter type is used in components and it exposes its data as `Readable` stores,
// while the former is used in mutations and exposes `Writable` stores.
// TODO try to improve this to 1) be generic, 2) not export, and 3) have no runtime representation
type Typecheck<T extends Ui> = T;
export type Typechecked = Typecheck<WritableUi>;
