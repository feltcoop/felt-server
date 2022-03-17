import type {Community} from '$lib/vocab/community/community.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {AccountModel} from '$lib/vocab/account/account.js';
import type {Persona} from '$lib/vocab/persona/persona.js';
import type {Membership} from '$lib/vocab/membership/membership';

// This uses ambient global types because following the instructions here
// https://github.com/sveltejs/kit/discussions/3772
// using `declare global` does not work for `type Session = ClientSession`
// after importing it. (though it *does* work if `ClientSession` is a property of `Session`)
// This appears to be a quirk of TypeScript to not allow re-export of top-level types.

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
