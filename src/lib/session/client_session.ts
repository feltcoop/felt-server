import type {Community} from '$lib/communities/community.js';
import type {AccountModel} from '$lib/vocab/account/account.js';
import type {Member} from '$lib/members/member.js';
import type {Persona} from '$lib/personas/persona.js';

export type ClientSession = AccountSession | GuestSession;

export interface AccountSession {
	personas: Persona[];
	account: AccountModel;
	communities: Community[];
	//Stub for a Friends feature in future release, for now just returns all users in an instance
	members: Member[];
	guest?: false; // is only for types; this property doesn't exist at runtime
}

export interface GuestSession {
	guest: true;
}
