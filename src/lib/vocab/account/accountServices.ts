import type {Account} from '$lib/vocab/account/account.js';
import {verifyPassword} from '$lib/util/password';
import {Login, Logout} from '$lib/session/sessionEvents';
import type {ServiceByName} from '$lib/app/eventTypes';

export const LoginService: ServiceByName['Login'] = {
	event: Login,
	perform: async ({repos, params, account_id, session}) => {
		const {username, password} = params;

		// If the browser session is out of sync with the server,
		// the client may think it's logged out when the server sees a session.
		// To avoid bugs and confusion, this logs out the user and asks them to try again.
		if (account_id) {
			session.logout();
			return {
				ok: false,
				status: 400,
				message: 'something went wrong, please try again',
			};
		}

		// First see if the account already exists.
		const findAccountResult = await repos.account.findByName(username);
		let account: Account;
		if (findAccountResult.ok) {
			// There's already an account, so proceed to log in after validating the password.
			account = findAccountResult.value;
			if (!(await verifyPassword(password, account.password))) {
				return {ok: false, status: 400, message: 'invalid account name or password'};
			}
		} else {
			// There's no account, so create one.
			const createAccountResult = await repos.account.create(username, password);
			if (createAccountResult.ok) {
				account = createAccountResult.value;
			} else {
				// Failed to create the account.
				return {ok: false, status: 500, message: 'failed to create account'};
			}
		}

		const clientSessionResult = await repos.session.loadClientSession(account.account_id);

		if (clientSessionResult.ok) {
			const result = session.login(account.account_id);
			if (!result.ok) return {ok: false, status: 500, message: result.message};
			return {
				ok: true,
				status: 200,
				value: {session: clientSessionResult.value},
			};
		}
		return {
			ok: false,
			status: 500,
			message: 'failed to load client session',
		};
	},
};

export const LogoutService: ServiceByName['Logout'] = {
	event: Logout,
	perform: async ({session}) => {
		const result = session.logout();
		if (!result.ok) return {ok: false, status: 500, message: result.message};
		return {
			ok: true,
			status: 200,
			value: null,
		};
	},
};
