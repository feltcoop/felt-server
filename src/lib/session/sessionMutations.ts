import {browser} from '$app/env';
import {session as sveltekitSession} from '$app/stores';
import {writable} from '@feltcoop/svelte-gettable-stores';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Mutations} from '$lib/app/eventTypes';
import {deserialize, deserializers} from '$lib/util/deserialize';
import {isHomeSpace} from '$lib/vocab/space/spaceHelpers';
import type {Persona} from '$lib/vocab/persona/persona';
import {updateEntity} from '$lib/vocab/entity/entityMutationHelpers';

const log = new Logger('[ui]');

export const LoginAccount: Mutations['LoginAccount'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	sveltekitSession.set(result.value.session);
	return result;
};

export const LogoutAccount: Mutations['LogoutAccount'] = async ({invoke}) => {
	const result = await invoke();
	if (!result.ok) return result;
	sveltekitSession.set({guest: true});
	return result;
};

export const SetSession: Mutations['SetSession'] = async ({params: {session}, ui}) => {
	const {
		account,
		personaById,
		communityById,
		personas,
		communities,
		spaceById,
		spaces,
		memberships,
		personaIdSelection,
		sessionPersonas,
		communityIdSelectionByPersonaId,
		spaceIdSelectionByCommunityId,
	} = ui;
	const {guest} = session;

	if (browser) log.trace('[setSession]', session);
	deserialize(deserializers)(session);
	account.set(guest ? null : session.account);

	const $personas = (guest ? [] : toInitialPersonas(session)).map((p) => writable(p));
	personaById.clear();
	$personas.forEach((p) => personaById.set(p.get().persona_id, p));
	personas.swap($personas);

	const $sessionPersonas = guest ? [] : session.sessionPersonas;
	sessionPersonas.set($sessionPersonas.map((p) => personaById.get(p.persona_id)!));

	const $communities = (guest ? [] : session.communities).map((p) => writable(p));
	communityById.clear();
	$communities.forEach((c) => communityById.set(c.get().community_id, c));
	communities.swap($communities);

	const $spaces = guest ? [] : session.spaces.map((s) => writable(s));
	spaceById.clear();
	$spaces.forEach((s) => spaceById.set(s.get().space_id, s));
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
						spaceIdSelectionByCommunityId
							.getJson()
							?.find((v) => v[0] === $community.community_id)?.[1] ||
							session.spaces.find(
								(s) => s.community_id === $community.community_id && isHomeSpace(s),
							)!.space_id,
				  ]),
		),
	);

	// Add entities after the other stores are ready.
	if (!guest) session.directories.forEach((d) => updateEntity(ui, d));
};

// TODO This is a hack until we figure out how to handle "session personas" differently from the rest.
// The issue is that the "session personas" have private fields populated
// but we don't treat them separately from regular personas when using them,
// so as a hack we swap the session personas in for the regular personas,
// but these probably need to be split into two separate collections.
// Any code that needs session personas given a regular persona could do a lookup,
// but otherwise we'd be passing around the `Persona` objects in most cases.
// This would make things typesafe as well.
const toInitialPersonas = (session: ClientSession): Persona[] =>
	session.guest
		? []
		: session.sessionPersonas.concat(
				session.personas.filter(
					(p1) => !session.sessionPersonas.find((p2) => p2.persona_id === p1.persona_id),
				),
		  );
