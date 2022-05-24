import dotenv from 'dotenv';
import {copyFileSync, existsSync} from 'fs';

// TODO how to configure this stuff in user projects? felt/gro config?

export const ENV_PROD = '.env.production';
export const ENV_DEV = '.env.development';

const dev = import.meta?.env?.DEV ?? process.env.NODE_ENV !== 'production'; // TODO support in Gro and remove second half

const envs: Array<{file: string; defaultFile: string}> = [
	{file: '.env', defaultFile: 'src/infra/.env.default'},
	dev
		? {file: ENV_DEV, defaultFile: `src/infra/${ENV_DEV}.default`}
		: {file: ENV_PROD, defaultFile: `src/infra/${ENV_PROD}.default`},
];

interface Env {
	VITE_GIT_HASH: string;
	COOKIE_KEYS: string;
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

// Adds or updates an env var `value` for `key`.
export const updateEnv = (contents: string, key: string, value: string): string => {
	const matcher = new RegExp(`^${key}=(.*)$`, 'mu');
	const matched = contents.match(matcher);
	if (matched) {
		if (matched[1] === value) return contents;
		return contents.replace(matcher, `${key}=${value}`);
	}
	return contents + (contents.endsWith('\n') ? '' : '\n') + `${key}=${value}`;
};
