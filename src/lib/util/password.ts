import {scrypt} from 'crypto';
import {promisify} from 'util';

const to_scrypt = promisify(scrypt);

const salt = 'TODO_SALT_SECRET'; // TODO security

export const to_password_hash = async (password: string): Promise<string> =>
	((await to_scrypt(password, salt, 32)) as Buffer).toString('hex');
