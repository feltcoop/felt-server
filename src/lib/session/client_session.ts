import type {Community} from '$lib/communities/community.js';
import type {AccountModel} from '$lib/vocab/account/account.js';
import type {Member} from '$lib/members/member.js';
import type {Persona} from '$lib/personas/persona.js';
import type {IncomingMessage} from 'http';
import cookie_session from 'cookie-session';

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
