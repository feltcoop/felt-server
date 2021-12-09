import dotenv from 'dotenv';
import {copyFileSync, existsSync} from 'fs';

// TODO does this stuff belong in `src/server/env.ts`?
// TODO how to configure this stuff in user projects? felt/gro config?

export const ENV_PROD = '.env.production';

const dev = import.meta?.env?.DEV ?? process.env.NODE_ENV !== 'production'; // TODO support in Gro and remove second half
console.log('drawing env from dev', dev);

const envs: {file: string; defaultFile: string}[] = [
	{file: '.env', defaultFile: 'src/infra/.env.default'},
	dev
		? {file: '.env.development', defaultFile: 'src/infra/.env.development.default'}
		: {file: ENV_PROD, defaultFile: `src/infra/${ENV_PROD}.default`},
];

interface Env {
	VITE_GIT_HASH: string;
	COOKIE_KEYS: string; // TODO validate this somehow to avoid production security issues
	VITE_DEPLOY_SERVER_HOST: string;
	DEPLOY_IP: string;
	DEPLOY_USER: string;
	EMAIL_ADDRESS: string;
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
