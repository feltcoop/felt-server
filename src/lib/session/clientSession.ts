import type {Community} from '$lib/communities/community.js';
import type {Account} from '$lib/vocab/account/account.js';
import type {Entity} from '$lib/vocab/entity/entity.js';
import type {Member} from '$lib/members/member.js';

export type ClientSession = AccountSession | GuestSession;

export type ClientAccount = Pick<Account, 'name' | 'account_id'>;

export interface AccountSession {
	account: ClientAccount;
	communities: Community[];
	//Stub for a Friends feature in future release, for now just returns all users in an instance
	friends: Member[];
	entities: Entity[];
	guest?: false; // is only for types; this property doesn't exist at runtime
}

export interface GuestSession {
	guest: true;
}
