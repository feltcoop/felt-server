import dotenv from 'dotenv';
import {copyFileSync, existsSync} from 'fs';

const ENV_FILE = '.env';
const DEFAULT_ENV_FILE = 'src/infra/.env.default';

interface Env {
	SERVER_HOST: string;
	SVELTEKIT_SERVER_HOST: string;
	API_SERVER_HOST: string;

	VITE_WEBSOCKET_URL: string;

	DEPLOY_IP: string;
	DEPLOY_USER: string;

	PASSWORD_SALT: string;
	COOKIE_KEYS: string;
}

let loaded = false;

export const fromEnv = (key: keyof Env): string => {
	if (!loaded) {
		loaded = true;
		if (!existsSync(ENV_FILE)) {
			copyFileSync(DEFAULT_ENV_FILE, ENV_FILE);
		}
		dotenv.config({path: ENV_FILE});
	}
	const value = process.env[key];
	if (value === undefined) {
		throw Error(`Missing env key: ${key}`);
	}
	return value;
};
