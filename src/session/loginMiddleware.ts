import send from '@polka/send-type';
import {scrypt} from 'crypto';
import {promisify} from 'util';

import type {ApiServer, Middleware} from '../server/ApiServer.js';
import type {User} from '../vocab/user/user.js';

// TODO move this?
const salt = 'TODO_SALT_SECRET';
const toScrypt = promisify(scrypt);
const toHash = async (password: string): Promise<string> =>
	((await toScrypt(password, salt, 32)) as any).toString('hex'); // TODO why is the type cast needed?

export interface LoginRequest {
	username: string;
	password: string; // 🤫
}

export const toLoginMiddleware = (server: ApiServer): Middleware => {
	const {db} = server;
	return async (req, res) => {
		const loginRequest: LoginRequest = req.body as any; // TODO validate with JSON schema and generate `LoginRequest`
		const {username, password} = loginRequest;
		console.log('[loginMiddleware] req.body', username); // TODO logging
		// TODO formalize and automate validation and normalization
		if (!username) return send(res, 400, {reason: 'invalid username'});
		if (!password) return send(res, 400, {reason: 'invalid password'});
		if (req.user) {
			if (req.user.name === username) {
				return send(res, 400, {reason: 'already logged in'});
			} else {
				return send(res, 400, {
					reason:
						`Already logged in with username '${req.user.name}'.` +
						` Please first log out if you wish to log in with username '${username}'.`,
				});
			}
		}

		const passwordHash = await toHash(password);

		// First see if the user already exists.
		const findUserResult = await db.repos.users.findByName(username);
		console.log('findUserResult', findUserResult);
		let user: User;
		if (findUserResult.ok) {
			// There's already an user, so proceed to log in after validating the password.
			user = findUserResult.value;
			if (user.password !== passwordHash) {
				return send(res, 400, {reason: 'wrong password'});
			}
		} else if (findUserResult.type === 'noAccountFound') {
			// There's no user, so create one.
			const createUserResult = await db.repos.users.create(username, passwordHash);
			console.log('createUserResult', createUserResult);
			if (createUserResult.ok) {
				user = createUserResult.value;
			} else {
				// Failed to create the user some unknown reason.
				return send(res, 500, {reason: createUserResult.reason});
			}
		} else {
			// Failed to find the user some reason.
			return send(res, 400, {reason: findUserResult.reason});
		}

		console.log('[login]', user.name); // TODO logging
		req.session.name = user.name;
		const clientSession = await db.repos.session.loadClientSession(user.name);
		return send(res, 200, {session: clientSession}); // TODO API types
	};
};
