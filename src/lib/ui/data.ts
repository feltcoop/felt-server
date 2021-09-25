import {writable, get, derived} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';

import type {ClientSession} from '$lib/session/clientSession';
import type {Community} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {AccountModel} from '$lib/vocab/account/account';
import type {Persona} from '$lib/vocab/persona/persona';
import type {File} from '$lib/vocab/file/file';
import type {Membership} from '$lib/vocab/membership/membership';

// TODO refactor/rethink

// TODO name? maybe `db`? do we need more abstractions?

const KEY = Symbol();

export const getData = (): DataStore => getContext(KEY);

export const setData = (session: ClientSession): DataStore => {
	const store = toDataStore(session);
	setContext(KEY, store);
	return store;
};

export interface DataState {
	account: AccountModel | null;
	communities: Community[];
	memberships: Membership[]; // TODO needs to be used, currently only gets populated when a new membership is created
	spaces: Space[];
	personas: Persona[];
	filesBySpace: Record<number, File[]>;
}

export interface DataStore {
	subscribe: Readable<DataState>['subscribe'];
	// TODO this is actually a writable as implemented, but with the type do we care?
	// or do we want to protect the API from being called in unexpected ways?
	personas: Readable<Readable<Persona>[]>;
	personasById: Readable<Map<number, Readable<Persona>>>;
	updateSession: (session: ClientSession) => void;
	addPersona: (persona: Persona) => void;
	addCommunity: (community: Community, persona_id: number) => void;
	addMembership: (membership: Membership) => void;
	addSpace: (space: Space, community_id: number) => void;
	addFile: (file: File) => void;
	setFiles: (space_id: number, files: File[]) => void;
	// TODO experimental api -- returning derived stores as lazily created live queries
	// findPersonasByIdByCommunity: (community_id: number) => Readable<Map<number, Persona>>;
	findPersonaById: (persona_id: number) => Readable<Persona>;
}

// TODO probably don't want to pass `initialSession` because it'll never be GC'd
export const toDataStore = (initialSession: ClientSession): DataStore => {
	const initialData = toDefaultData(initialSession);
	const {subscribe, set, update} = writable(initialData);

	// importantly, this only changes when items are added or removed from the collection,
	// not when the items themselves change; each item is a store that can be subscribed to
	const personas = writable<Readable<Persona>[]>(
		initialSession.guest ? [] : initialSession.allPersonas.map((p) => writable(p)),
	);
	// TODO do this more efficiently
	const personasById: Readable<Map<number, Readable<Persona>>> = derived(
		personas,
		($personas) => new Map($personas.map((persona) => [get(persona).persona_id, persona])),
	);

	const store: DataStore = {
		subscribe,
		personas,
		personasById,
		updateSession: (session) => {
			console.log('[data.updateSession]', session);
			set(toDefaultData(session));
		},
		addPersona: (persona) => {
			console.log('[data.addPersona]', persona);
			personas.update(($personas) => $personas.concat(writable(persona)));
		},
		addCommunity: (community, persona_id) => {
			// TODO instead of this, probably want to set more granularly with nested stores
			console.log('[data.addCommunity]', community);
			// TODO update `personas` writable
			update(($data) => ({
				...$data,
				communities: $data.communities.concat(community),
				// TODO how should this be modeled and kept up to date?
				personas: $data.personas.map((persona) =>
					persona.persona_id === persona_id
						? {...persona, community_ids: persona.community_ids.concat(community.community_id)}
						: persona,
				),
			}));
		},
		addMembership: (membership) => {
			// TODO instead of this, probably want to set more granularly with nested stores
			console.log('[data.addMembership]', membership);
			update(($data) => ({
				...$data,
				memberships: $data.memberships.concat(membership),
				// TODO update `communities.personas` (which will be refactored)
			}));
		},
		addSpace: (space, community_id) => {
			// TODO instead of this, probably want to set more granularly with nested stores
			console.log('[data.addSpace]', space);
			update(($data) => ({
				...$data,
				spaces: $data.spaces.concat(space),
				communities: $data.communities.map((community) =>
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
			update(($data) => ({
				...$data,
				filesBySpace: {
					...$data.filesBySpace,
					[file.space_id]: ($data.filesBySpace[file.space_id] || []).concat(file),
				},
			}));
		},
		setFiles: (space_id, files) => {
			console.log('[data.setFiles]', files);
			update(($data) => ({
				...$data,
				filesBySpace: {
					...$data.filesBySpace,
					[space_id]: files,
				},
			}));
		},
		findPersonaById: (persona_id: number): Readable<Persona> => {
			const persona = get(personasById).get(persona_id);
			if (!persona) throw Error(`Unknown persona ${persona_id}`);
			return persona;
		},
	};
	return store;
};

const toDefaultData = (session: ClientSession): DataState => {
	if (session.guest) {
		return {
			account: null,
			communities: [],
			memberships: [],
			spaces: [],
			personas: [],
			filesBySpace: {},
		};
	} else {
		return {
			account: session.account,
			communities: session.communities,
			memberships: [], // TODO should be on session
			// TODO session should already have a flat array of spaces
			spaces: session.communities.flatMap((community) => community.spaces),
			personas: session.personas,
			filesBySpace: {},
		};
	}
};
