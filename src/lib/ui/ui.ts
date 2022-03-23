import {writable, derived, get, type Readable, type Writable} from 'svelte/store';
import {setContext, getContext, type SvelteComponent} from 'svelte';
import {mutable, type Mutable} from '@feltcoop/svelte-mutable-store';
import type {DialogData} from '@feltcoop/felt/ui/dialog/dialog.js';
import {browser} from '$app/env';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {Persona} from '$lib/vocab/persona/persona';
import type {ClientSession} from '$lib/session/clientSession';
import type {AccountModel} from '$lib/vocab/account/account';
import type {Entity} from '$lib/vocab/entity/entity';
import type {Membership} from '$lib/vocab/membership/membership';
import {createContextmenuStore, type ContextmenuStore} from '$lib/ui/contextmenu/contextmenu';
import type {ViewData} from '$lib/vocab/view/view';
import {initBrowser} from '$lib/ui/init';

if (browser) initBrowser();

const log = new Logger('[ui]');

const KEY = Symbol();

export const getUi = (): Ui => getContext(KEY);

export const setUi = (store: Ui): Ui => {
	setContext(KEY, store);
	return store;
};

export interface Ui {
	session: Readable<ClientSession>;
	setSession: ($session: ClientSession) => void;
	destroy: () => void;

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
	// view state
	expandMainNav: Readable<boolean>;
	expandMarquee: Readable<boolean>;
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
	dialogs: Readable<DialogData[]>;
	viewBySpace: Mutable<WeakMap<Readable<Space>, ViewData>>; // client overrides for the views set by the community
}

export type WritableUi = ReturnType<typeof toUi>;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const toUi = (
	session: Writable<ClientSession>,
	initialMobile: boolean,
	components: {[key: string]: typeof SvelteComponent},
) => {
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
	const spacesByCommunityId: Readable<Map<number, Array<Writable<Space>>>> = derived(
		[communities, spaces],
		([$communities, $spaces]) => {
			const map: Map<number, Array<Writable<Space>>> = new Map();
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

	const personasByCommunityId: Readable<Map<number, Array<Writable<Persona>>>> = derived(
		[communities, memberships],
		([$communities, $memberships]) => {
			const map: Map<number, Array<Writable<Persona>>> = new Map();
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
	const communitiesBySessionPersona: Readable<Map<Writable<Persona>, Array<Writable<Community>>>> =
		derived(
			[sessionPersonas, memberships, communities],
			([$sessionPersonas, $memberships, $communities]) => {
				const map: Map<Writable<Persona>, Array<Writable<Community>>> = new Map();
				for (const sessionPersona of $sessionPersonas) {
					const $sessionPersona = get(sessionPersona);
					const sessionPersonaCommunities: Array<Writable<Community>> = [];
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

	const ui = {
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
		session,
		setSession: ($session: ClientSession) => {
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
									//TODO lookup space by community_id+url (see this comment in multiple places)
									const $homeSpace = $session.spaces.find(
										(s) => s.community_id === $community.community_id && s.url === '/',
									)!;
									return [$community.community_id, $homeSpace.space_id];
								})
								.filter(Boolean),
					  ),
			);
		},
	} as const;

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

// This ensures that the inferred `WritableUi` is assignable to `Ui`.
// The latter type is used in components and it exposes its data as `Readable` stores,
// while the former is used in mutations and exposes `Writable` stores.
// TODO is there a better way to do this assertion without any runtime code?
// @see https://github.com/feltcoop/felt-server/pull/292
// and @see https://github.com/feltcoop/felt-server/pull/292/commits/f24a7377a7328df6071771facaacb6464e10a000
// for runtime alternatives. (though they could be elided in production code probably)
type Typecheck<T extends Ui> = T;
export type Typechecked = Typecheck<WritableUi>;
