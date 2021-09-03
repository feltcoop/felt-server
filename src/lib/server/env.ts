import dotenv from 'dotenv';
import {copyFileSync, existsSync} from 'fs';

const envs: {file: string; defaultFile: string}[] = [
	// any changes to this path must also be made in `svelte.config.js`
	{file: '.env', defaultFile: 'src/infra/.env.default'},
	{file: '.env.development', defaultFile: 'src/infra/.env.development.default'},
	{file: '.env.production', defaultFile: 'src/infra/.env.production.default'},
];
interface Env {
	// server vars
	SVELTEKIT_SERVER_HOST: string;
	API_SERVER_HOST: string;

	// client vars
	VITE_WEBSOCKET_URL: string;

	// secret vars
	COOKIE_KEYS: string; // TODO validate this somehow to avoid production security issues

	// deploy vars
	DEPLOY_IP: string;
	DEPLOY_USER: string;
}

let loaded = false;

export const fromEnv = (key: keyof Env): string => {
	if (!loaded) {
		loaded = true;
		loadEnvs();
	}
	const value = process.env[key];
	if (value === undefined) {
		throw Error(`Missing environment variable: ${key}`);
	}
	return value;
};

const loadEnvs = () => {
	for (const env of envs) {
		if (!existsSync(env.file)) {
			copyFileSync(env.defaultFile, env.file);
		}
		dotenv.config({path: env.file});
	}
};
