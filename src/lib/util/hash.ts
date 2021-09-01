import {randomBytes, scrypt} from 'crypto';
import {promisify} from 'util';

const to_scrypt = promisify(scrypt);

export const to_hash = async (password: string): Promise<string> =>
	((await to_scrypt(password, randomBytes(16), 32)) as any).toString('hex');
