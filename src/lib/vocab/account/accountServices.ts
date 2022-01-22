import type {Service} from '$lib/server/service';
import type {Account} from '$lib/vocab/account/account.js';
import {verifyPassword} from '$lib/util/password';
import {LoginAccount, LogoutAccount} from '$lib/vocab/account/account.events';
import type {
	LoginAccountParams,
	LoginAccountResponseResult,
	LogoutAccountParams,
	LogoutAccountResponseResult,
} from '$lib/app/eventTypes';

export const loginAccountService: Service<LoginAccountParams, LoginAccountResponseResult> = {
	event: LoginAccount,
	perform: async ({repos, params, account_id}) => {
		const {username, password} = params;
		console.log('[loginMiddleware] req.body', username); // TODO logging
		// TODO formalize and automate validation and normalization
		if (!username) return {ok: false, status: 400, message: 'invalid username'};
		if (!password) return {ok: false, status: 400, message: 'invalid password'};
		// TODO there's a problem here where the user may have cookies that need be cleared,
		// but the logout button never appears -- one way to fix this is
		// to show a logout button if this specific error is detected
		if (account_id) {
			return {ok: false, status: 400, message: 'already logged in'};
		}

		// First see if the account already exists.
		const findAccountResult = await repos.account.findByName(username);
		console.log('[loginMiddleware] findAccountResult', findAccountResult);
		let account: Account;
		if (findAccountResult.ok) {
			// There's already an account, so proceed to log in after validating the password.
			account = findAccountResult.value;
			if (!(await verifyPassword(password, account.password))) {
				return {ok: false, status: 400, message: 'invalid account name or password'};
			}
		} else if (findAccountResult.type === 'no_account_found') {
			// There's no account, so create one.
			const createAccountResult = await repos.account.create(username, password);
			console.log('[loginMiddleware] createAccountResult', createAccountResult);
			if (createAccountResult.ok) {
				account = createAccountResult.value;
			} else {
				// Failed to create the account.
				return {ok: false, status: 500, message: createAccountResult.message};
			}
		} else {
			// Failed to find the account.
			return {ok: false, status: 500, message: findAccountResult.message};
		}

		console.log('[loginMiddleware] login', account.account_id); // TODO logging
		const clientSessionResult = await repos.session.loadClientSession(account.account_id);

		if (clientSessionResult.ok) {
			return {
				ok: true,
				status: 200,
				value: {session: clientSessionResult.value},
				effects: [
					// login
					({req}) => {
						if (!req) return;
						req.session.account_id = account.account_id;
					},
				],
			};
		} else {
			return {
				ok: false,
				status: 500,
				message: 'failed to load client session',
				effects: [
					// logout
					({req}) => {
						if (!req) return;
						req.session = null!;
					},
				],
			};
		}
	},
};

export const logoutAccountService: Service<LogoutAccountParams, LogoutAccountResponseResult> = {
	event: LogoutAccount,
	perform: async () => {
		return {
			ok: true,
			status: 200,
			value: null,
			effects: [
				// logout
				({req}) => {
					if (!req) return;
					console.log('[logoutMiddleware] account', req.account_id); // TODO logging
					req.account_id = undefined!;
					req.session = null!;
				},
			],
		};
	},
};
