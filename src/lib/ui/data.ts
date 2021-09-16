import {writable} from 'svelte/store';
import type {Readable} from 'svelte/store';
import {setContext, getContext} from 'svelte';

import type {ClientSession} from '$lib/session/clientSession';
import {toCommunityModel} from '$lib/vocab/community/community';
import type {CommunityModel} from '$lib/vocab/community/community';
import type {Space} from '$lib/vocab/space/space';
import type {AccountModel} from '$lib/vocab/account/account';
import type {Persona} from '$lib/vocab/persona/persona';
import type {File} from '$lib/vocab/file/file';

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
	communities: CommunityModel[];
	spaces: Space[];
	allPersonas: Persona[]; //TODO; remove this when a real invite system is in place
	personas: Persona[];
	filesBySpace: Record<number, File[]>;
}

export interface DataStore {
	subscribe: Readable<DataState>['subscribe'];
	updateSession: (session: ClientSession) => void;
	addCommunity: (community: CommunityModel, persona_id: number) => void;
	addSpace: (space: Space, community_id: number) => void;
	addFile: (file: File) => void;
	setFiles: (space_id: number, files: File[]) => void;
}

// TODO probably don't want to pass `initialSession` because it'll never be GC'd
export const toDataStore = (initialSession: ClientSession): DataStore => {
	const {subscribe, set, update} = writable(toDefaultData(initialSession));
	const store: DataStore = {
		subscribe,
		updateSession: (session) => {
			console.log('[data.updateSession]', session);
			set(toDefaultData(session));
		},
		addCommunity: (community, persona_id) => {
			// TODO instead of this, probably want to set more granularly with nested stores
			console.log('[data.addCommunity]', community);
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
	};
	return store;
};

const toDefaultData = (session: ClientSession): DataState => {
	if (session.guest) {
		return {
			account: null,
			communities: [],
			spaces: [],
			allPersonas: [],
			personas: [],
			filesBySpace: {},
		};
	} else {
		return {
			account: session.account,
			communities: session.communities.map((community) => toCommunityModel(community)),
			// TODO session should already have a flat array of spaces
			spaces: session.communities.flatMap((community) => community.spaces),
			allPersonas: session.allPersonas,
			personas: session.personas,
			filesBySpace: {},
		};
	}
};
