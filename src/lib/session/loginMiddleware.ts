import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {Account} from '$lib/vocab/account/account.js';
import {toPasswordKey, verifyPassword} from '$lib/util/password';

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
		if (req.account_id) {
			return send(res, 400, {reason: 'already logged in'});
		}

		const passwordKey = await toPasswordKey(password);

		// First see if the account already exists.
		const findAccountResult = await db.repos.account.findByName(accountName);
		console.log('[loginMiddleware] findAccountResult', findAccountResult);
		let account: Account;
		if (findAccountResult.ok) {
			// There's already an account, so proceed to log in after validating the password.
			account = findAccountResult.value;
			if (!(await verifyPassword(account.password, passwordKey))) {
				return send(res, 400, {reason: 'invalid account name or password'});
			}
		} else if (findAccountResult.type === 'no_account_found') {
			// There's no account, so create one.
			const findAccountResult = await db.repos.account.create({
				name: accountName,
				password: passwordKey,
			});
			console.log('[loginMiddleware] createAccountResult', findAccountResult);
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

		console.log('[loginMiddleware] login', account.account_id); // TODO logging
		req.session.account_id = account.account_id;
		const clientSessionResult = await db.repos.session.loadClientSession(account.account_id);

		if (clientSessionResult.ok) {
			return send(res, 200, {session: clientSessionResult.value}); // TODO API types
		} else {
			return send(res, 500, {reason: 'problem loading client session'});
		}
	};
};
