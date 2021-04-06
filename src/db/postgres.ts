import type {Sql, Options} from 'postgres';
import {numberFromEnv, stringFromEnv} from '@feltcoop/gro/dist/utils/env.js';

export type PostgresSql = Sql<PostgresTypeMap>;

export type PostgresOptions = Options<PostgresTypeMap>;

// TODO use this to pass through custom types
export type PostgresTypeMap = Record<string, unknown>;

export const toDefaultPostgresOptions = (): PostgresOptions => ({
	host: stringFromEnv('PGHOST'),
	port: numberFromEnv('PGPORT', 5432),
	database: stringFromEnv('PGDATABASE', 'felt'),
	username: stringFromEnv('PGUSERNAME', stringFromEnv('PGUSER', 'postgres')),
	password: stringFromEnv('PGPASSWORD', 'password'),
	idle_timeout: numberFromEnv('PGIDLE_TIMEOUT'),
	connect_timeout: numberFromEnv('PGCONNECT_TIMEOUT'),
});
