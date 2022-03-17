import type {Community} from '$lib/vocab/community/community.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {AccountModel} from '$lib/vocab/account/account.js';
import type {Persona} from '$lib/vocab/persona/persona.js';
import type {Membership} from '$lib/vocab/membership/membership';

declare global {
	type ClientSession = ClientAccountSession | ClientGuestSession;

	interface ClientAccountSession {
		personas: Persona[];
		account: AccountModel;
		communities: Community[];
		spaces: Space[];
		memberships: Membership[];
		//Stub for a Friends feature in future release, for now just returns all personas in an instance
		allPersonas: Persona[];
		guest?: false; // is only for types; this property doesn't exist at runtime
	}

	interface ClientGuestSession {
		guest: true;
	}
}
