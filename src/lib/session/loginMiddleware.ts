import send from '@polka/send-type';

import type {ApiServer, Middleware} from '$lib/server/ApiServer.js';
import type {Account} from '$lib/vocab/account/account.js';
import {verifyPassword} from '$lib/util/password';
import type {LogInParams} from '$lib/app/eventTypes';

export const toLoginMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		const loginRequest: LogInParams = req.body as any; // TODO validate with JSON schema (by making it a service, probably)
		const {accountName, password} = loginRequest;
		console.log('[loginMiddleware] req.body', accountName); // TODO logging
		// TODO formalize and automate validation and normalization
		if (!accountName) return send(res, 400, {message: 'invalid account name'});
		if (!password) return send(res, 400, {message: 'invalid password'});
		if (req.account_id) {
			return send(res, 400, {message: 'already logged in'});
		}

		// First see if the account already exists.
		const findAccountResult = await db.repos.account.findByName(accountName);
		console.log('[loginMiddleware] findAccountResult', findAccountResult);
		let account: Account;
		if (findAccountResult.ok) {
			// There's already an account, so proceed to log in after validating the password.
			account = findAccountResult.value;
			if (!(await verifyPassword(password, account.password))) {
				return send(res, 400, {message: 'invalid account name or password'});
			}
		} else if (findAccountResult.type === 'no_account_found') {
			// There's no account, so create one.
			const createAccountResult = await db.repos.account.create(accountName, password);
			console.log('[loginMiddleware] createAccountResult', createAccountResult);
			if (createAccountResult.ok) {
				account = createAccountResult.value;
			} else {
				// Failed to create the account.
				return send(res, 500, {message: createAccountResult.message});
			}
		} else {
			// Failed to find the account.
			return send(res, 500, {message: findAccountResult.message});
		}

		console.log('[loginMiddleware] login', account.account_id); // TODO logging
		// TODO usage of `req` here is the only reason this can't be directly implemented as a `Service`, I think,
		// but we could make that a side effect that gets executed via callback or something,
		// maybe `effects` on the return value alongside `value`
		req.session.account_id = account.account_id;
		const clientSessionResult = await db.repos.session.loadClientSession(account.account_id);

		if (clientSessionResult.ok) {
			return send(res, 200, {session: clientSessionResult.value}); // TODO API types
		} else {
			req.session = null!;
			return send(res, 500, {message: 'failed to load client session'});
		}
	};
};
