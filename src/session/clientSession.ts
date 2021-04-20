import type {Community} from 'src/communities/community.js';
import type {Account} from '../vocab/account/account.js';
import type {Entity} from '../vocab/entity/entity.js';

export type ClientSession = AccountSession | GuestSession;

export type ClientAccount = Pick<Account, 'name' | 'account_id'>;

export interface AccountSession {
	account: ClientAccount;
	communities: Community[];
	entities: Entity[];
	guest?: false; // is only for types; this property doesn't exist at runtime
}

export interface GuestSession {
	guest: true;
}
