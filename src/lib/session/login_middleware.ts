import send from '@polka/send-type';
import {scrypt} from 'crypto';
import {promisify} from 'util';

import type {Api_Server, Middleware} from '$lib/server/Api_Server.js';
import type {Account} from '$lib/vocab/account/account.js';

// TODO move this?
const salt = 'TODO_SALT_SECRET';
const to_scrypt = promisify(scrypt);
const to_hash = async (password: string): Promise<string> =>
	((await to_scrypt(password, salt, 32)) as any).toString('hex'); // TODO why is the type cast needed?

export interface Login_Request {
	account_name: string;
	password: string; // 🤫
}

export const to_login_middleware = (server: Api_Server): Middleware => {
	const {db} = server;
	return async (req, res) => {
		const login_request: Login_Request = req.body as any; // TODO validate with JSON schema and generate `Login_Request`
		const {account_name, password} = login_request;
		console.log('[login_middleware] req.body', account_name); // TODO logging
		// TODO formalize and automate validation and normalization
		if (!account_name) return send(res, 400, {reason: 'invalid account_name'});
		if (!password) return send(res, 400, {reason: 'invalid password'});
		if (req.account_session) {
			if (req.account_session.account.name === account_name) {
				return send(res, 400, {reason: 'already logged in'});
			} else {
				return send(res, 400, {
					reason:
						`Already logged in with account_name '${req.account_session.account.name}'.` +
						` Please first log out if you wish to log in with account_name '${account_name}'.`,
				});
			}
		}

		const password_hash = await to_hash(password);

		// First see if the account already exists.
		const find_account_result = await db.repos.accounts.find_by_name(account_name);
		console.log('[login_middleware] find_account_result', find_account_result);
		let account: Account;
		if (find_account_result.ok) {
			// There's already an account, so proceed to log in after validating the password.
			account = find_account_result.value;
			if (account.password !== password_hash) {
				return send(res, 400, {reason: 'wrong password'});
			}
		} else if (find_account_result.type === 'no_account_found') {
			// There's no accoun, so create one.
			const find_account_result = await db.repos.accounts.create(account_name, password_hash);
			console.log('createAccountResult', find_account_result);
			if (find_account_result.ok) {
				account = find_account_result.value;
			} else {
				// Failed to create the account some unknown reason.
				return send(res, 500, {reason: find_account_result.reason});
			}
		} else {
			// Failed to find the account some reason.
			return send(res, 400, {reason: find_account_result.reason});
		}

		console.log('[login]', account.name); // TODO logging
		req.session.name = account.name;
		const client_session_result = await db.repos.session.load_client_session(account.name);
		if (client_session_result.ok) {
			return send(res, 200, {session: client_session_result.value}); // TODO API types
		} else {
			return send(res, 500, {reason: 'problem loading client session'});
		}
	};
};
