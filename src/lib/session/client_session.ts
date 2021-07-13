import type {Community} from '$lib/communities/community.js';
import type {Account} from '$lib/vocab/account/account.js';
import type {Entity} from '$lib/vocab/entity/entity.js';
import type {Member} from '$lib/members/member.js';

export type Client_Session = Account_Session | Guest_Session;

export type Client_Account = Pick<Account, 'name' | 'account_id'>;

export interface Account_Session {
	account: Client_Account;
	communities: Community[];
	//Stub for a Friends feature in future release, for now just returns all users in an instance
	friends: Member[];
	entities: Entity[];
	guest?: false; // is only for types; this property doesn't exist at runtime
}

export interface Guest_Session {
	guest: true;
}
