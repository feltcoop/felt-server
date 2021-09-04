import dotenv from 'dotenv';
import {copyFileSync, existsSync} from 'fs';

// TODO does this stuff belong in `src/server/env.ts`?
// TODO how to configure this stuff in user projects? felt/gro config?

const dev = import.meta?.env?.DEV ?? process.env.NODE_ENV !== 'production'; // TODO support in Gro and remove second half

const envs: {file: string; defaultFile: string}[] = [
	{file: '.env', defaultFile: 'src/infra/.env.default'},
	dev
		? {file: '.env.development', defaultFile: 'src/infra/.env.development.default'}
		: {file: '.env.production', defaultFile: 'src/infra/.env.production.default'},
];

interface Env {
	COOKIE_KEYS: string; // TODO validate this somehow to avoid production security issues
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
