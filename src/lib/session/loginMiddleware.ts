import send from '@polka/send-type';
import {scrypt} from 'crypto';
import {promisify} from 'util';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {Account} from '$lib/vocab/account/account.js';

// TODO move this?
const salt = 'TODO_SALT_SECRET';
const toScrypt = promisify(scrypt);
const toHash = async (password: string): Promise<string> =>
	((await toScrypt(password, salt, 32)) as any).toString('hex'); // TODO why is the type cast needed?

export interface LoginRequest {
	accountName: string;
	password: string; // 🤫
}

export const toLoginMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		const loginRequest: LoginRequest = req.body as any; // TODO validate with JSON schema and generate `LoginRequest`
		const {accountName, password} = loginRequest;
		console.log('[loginMiddleware] req.body', accountName); // TODO logging
		// TODO formalize and automate validation and normalization
		if (!accountName) return send(res, 400, {reason: 'invalid accountName'});
		if (!password) return send(res, 400, {reason: 'invalid password'});
		if (req.accountSession) {
			if (req.accountSession.account.name === accountName) {
				return send(res, 400, {reason: 'already logged in'});
			} else {
				return send(res, 400, {
					reason:
						`Already logged in with accountName '${req.accountSession.account.name}'.` +
						` Please first log out if you wish to log in with accountName '${accountName}'.`,
				});
			}
		}

		const passwordHash = await toHash(password);

		// First see if the account already exists.
		const findAccountResult = await db.repos.accounts.findByName(accountName);
		console.log('[loginMiddleware] findAccountResult', findAccountResult);
		let account: Account;
		if (findAccountResult.ok) {
			// There's already an account, so proceed to log in after validating the password.
			account = findAccountResult.value;
			if (account.password !== passwordHash) {
				return send(res, 400, {reason: 'wrong password'});
			}
		} else if (findAccountResult.type === 'noAccountFound') {
			// There's no accoun, so create one.
			const findAccountResult = await db.repos.accounts.create(accountName, passwordHash);
			console.log('createAccountResult', findAccountResult);
			if (findAccountResult.ok) {
				account = findAccountResult.value;
			} else {
				// Failed to create the account some unknown reason.
				return send(res, 500, {reason: findAccountResult.reason});
			}
		} else {
			// Failed to find the account some reason.
			return send(res, 400, {reason: findAccountResult.reason});
		}

		console.log('[login]', account.name); // TODO logging
		req.session.name = account.name;
		const clientSessionResult = await db.repos.session.loadClientSession(account.name);
		if (clientSessionResult.ok) {
			return send(res, 200, {session: clientSessionResult.value}); // TODO API types
		} else {
			return send(res, 500, {reason: 'problem loading client session'});
		}
	};
};
