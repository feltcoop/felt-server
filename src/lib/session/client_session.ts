import type {Community} from '$lib/communities/community.js';
import type {Account_Model} from '$lib/vocab/account/account.js';
import type {Member} from '$lib/members/member.js';
import type {Persona} from '$lib/personas/persona.js';

export type Client_Session = Account_Session | Guest_Session;

export interface Account_Session {
	personas: Persona[];
	account: Account_Model;
	communities: Community[];
	//Stub for a Friends feature in future release, for now just returns all users in an instance
	members: Member[];
	guest?: false; // is only for types; this property doesn't exist at runtime
}

export interface Guest_Session {
	guest: true;
}
