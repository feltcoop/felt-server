import type {Community} from '$lib/communities/community.js';
import type {Account_Model} from '$lib/vocab/account/account.js';
import type {Member} from '$lib/members/member.js';
import type {Persona} from '$lib/personas/persona.js';
import type {IncomingMessage} from 'http';
import cookie_session from 'cookie-session';

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

export interface SessionRequest extends Request {
	session?: SessionObject;
}

export interface SessionIncomingMessage extends IncomingMessage {
	session?: SessionObject;
}

export interface SessionObject {
	account_id: number;
}

const dev = process.env.NODE_ENV !== 'production';
const TODO_SERVER_COOKIE_KEYS = ['TODO', 'KEY_2_TODO', 'KEY_3_TODO'];

export const validateSession = (req: SessionRequest | SessionIncomingMessage) => {
	cookie_session({
		keys: TODO_SERVER_COOKIE_KEYS,
		maxAge: 1000 * 60 * 60 * 24 * 7 * 6, // 6 weeks
		secure: !dev, // this makes cookies break in prod unless https! see letsencrypt
		sameSite: dev ? 'lax' : false,
		name: 'session_id',
	})(req, {}, function () {
		return;
	});
};
