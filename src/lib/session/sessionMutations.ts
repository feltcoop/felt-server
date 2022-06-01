import {browser} from '$app/env';
import {writable} from '@feltcoop/svelte-gettable-stores';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Mutations} from '$lib/app/eventTypes';
import {LAST_SEEN_KEY} from '$lib/ui/app';

const log = new Logger('[ui]');

export const LoginAccount: Mutations['LoginAccount'] = async ({invoke, ui: {session}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	session.set(result.value.session);
	return result;
};

export const LogoutAccount: Mutations['LogoutAccount'] = async ({invoke, ui: {session}}) => {
	const result = await invoke();
	if (!result.ok) return result;
	session.set({guest: true});
	return result;
};

export const SetSession: Mutations['SetSession'] = async ({
	params: {session},
	ui: {
		account,
		personaById,
		communityById,
		personas,
		communities,
		spaceById,
		spaces,
		memberships,
		personaIdSelection,
		communityIdSelectionByPersonaId,
		spaceIdSelectionByCommunityId,
		lastSeenByDirectoryId,
	},
}) => {
	const {guest} = session;

	if (browser) log.trace('[setSession]', session);
	account.set(guest ? null : session.account);

	const $personaArray = guest ? [] : toInitialPersonas(session);
	const $personas = $personaArray.map((p) => writable(p));
	personaById.clear();
	$personas.forEach((p, i) => personaById.set($personaArray[i].persona_id, p));
	personas.swap($personas);

	const sessionPersonas = guest ? [] : session.sessionPersonas;
	sessionPersonas.set(sessionPersonas.map((p) => personaById.get(p.persona_id)!));

	const $communityArray = guest ? [] : session.communities;
	const $communities = $communityArray.map((p) => writable(p));
	communityById.clear();
	$communities.forEach((c, i) => communityById.set($communityArray[i].community_id, c));
	communities.swap($communities);

	const $spaceArray = guest ? [] : session.spaces;
	const $spaces = $spaceArray.map((s) => writable(s));
	spaceById.clear();
	$spaces.forEach((s, i) => spaceById.set($spaceArray[i].space_id, s));
	spaces.swap($spaces);

	memberships.swap(guest ? [] : session.memberships.map((s) => writable(s)));

	// TODO fix this and the 2 below to use the URL to initialize the correct persona+community+space
	const $firstSessionPersona = guest ? null : $sessionPersonas[0];
	personaIdSelection.set($firstSessionPersona?.persona_id ?? null);

	// TODO these two selections are hacky because using the derived stores
	// was causing various confusing issues, so they find stuff directly on the session objects
	// instead of using derived stores like `sessionPersonas` and `spacesByCommunityId`.
	communityIdSelectionByPersonaId.swap(
		// TODO first try to load this from localStorage
		new Map(guest ? null : $sessionPersonas.map(($p) => [$p.persona_id, $p.community_id])),
	);
	spaceIdSelectionByCommunityId.swap(
		//TODO lookup space by community_id+url (see this comment in multiple places)
		new Map(
			guest
				? null
				: session.communities.map(($community) => [
						$community.community_id,
						session.spaces.find(
							(s) => s.community_id === $community.community_id && isHomeSpace(s),
						)!.space_id,
				  ]),
		),
	);
	lastSeenByDirectoryId.swap(
		new Map(
			guest
				? null
				: session.spaces.map(($space) => [
						$space.directory_id,
						writable(
							(browser && localStorage.getItem(`${LAST_SEEN_KEY}${$space.directory_id}`)) ||
								new Date().toString(),
						),
				  ]),
		),
	);
};

// TODO this is a hack until we figure out how to handle "session personas" differently from the rest --
// the issue is that the "session personas" have their `community_ids` populated,
// so as a hack we prefer that instance in the global,
// but these probably need to be split into two separate collections --
// notice that comparison checks between the two types of personas will not be able to use store reference equality
const toInitialPersonas = (session: ClientSession): Persona[] =>
	session.guest
		? []
		: session.sessionPersonas.concat(
				session.personas.filter(
					(p1) => !session.sessionPersonas.find((p2) => p2.persona_id === p1.persona_id),
				),
		  );
