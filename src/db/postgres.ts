import type {Sql, Options} from 'postgres';
import {toEnvNumber, toEnvString} from '@feltcoop/gro/dist/utils/env.js';

export type PostgresSql = Sql<PostgresTypeMap>;

export type PostgresOptions = Options<PostgresTypeMap>;

// TODO use this to pass through custom types
export type PostgresTypeMap = Record<string, unknown>;

export const toDefaultPostgresOptions = (): PostgresOptions => ({
	host: toEnvString('PGHOST'),
	port: toEnvNumber('PGPORT', 5432),
	database: toEnvString('PGDATABASE', 'felt'),
	username: toEnvString('PGUSERNAME', toEnvString('PGUSER', 'postgres')),
	password: toEnvString('PGPASSWORD', 'password'),
	idle_timeout: toEnvNumber('PGIDLE_TIMEOUT'),
	connect_timeout: toEnvNumber('PGCONNECT_TIMEOUT'),
});
