import {randomBytes, scrypt, timingSafeEqual} from 'crypto';
import {promisify} from 'util';

const SALT_SIZE = 16;
const HASH_SIZE = 32;

const to_scrypt = promisify(scrypt);

// Returns the string `salt:hash` to be stored in the database.
// The returned key can be compared to a password attempt with `verify_password`.
export const to_password_key = async (password: string): Promise<string> => {
	const salt = randomBytes(SALT_SIZE).toString('hex');
	const hash = (await to_hash(password, salt)).toString('hex');
	return `${salt}:${hash}`;
};

// Checks if a `password` matches the generated hash and salt in `key` from `to_password_key`.
export const verify_password = async (password: string, key: string): Promise<boolean> => {
	const [salt, hash] = key.split(':');
	return timingSafeEqual(Buffer.from(hash, 'hex'), await to_hash(password, salt));
};

const to_hash = (password: string, salt: string): Promise<Buffer> =>
	to_scrypt(password, salt, HASH_SIZE) as any;
