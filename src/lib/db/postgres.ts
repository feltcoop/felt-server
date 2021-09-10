import type {Sql, Options} from 'postgres';
import {toEnvNumber, toEnvString} from '@feltcoop/felt/util/env.js';

// Postgres.js - PostgreSQL client for Node.js
// https://github.com/porsager/postgres

export type PostgresSql = Sql<PostgresTypeMap>;

// was using a type helper here, but worsens usage because of the complexity
export interface PostgresOptions extends Options<PostgresTypeMap> {
	host: string;
	port: number;
	database: string;
	username: string;
	password: string;
}

// TODO use this to pass through custom types
export type PostgresTypeMap = Record<string, unknown>;

const toDefaultPostgresOptions = (): PostgresOptions => ({
	host: toEnvString('PGHOST', 'localhost'),
	port: toEnvNumber('PGPORT', 5432),
	database: toEnvString('PGDATABASE', 'felt'),
	username: toEnvString('PGUSERNAME', toEnvString('PGUSER', 'postgres')),
	password: toEnvString('PGPASSWORD', 'password'),
	idle_timeout: toEnvNumber('PGIDLE_TIMEOUT'),
	connect_timeout: toEnvNumber('PGCONNECT_TIMEOUT')!, // TODO `!` is a type hack, try updating the lib
});

export const defaultPostgresOptions = toDefaultPostgresOptions();

// update `process.env` so tools like `ley` see our values
// TODO maybe add a flag to the `toEnv` APIs to set the value if it's undefined (set as a string!)
process.env.PGHOST = defaultPostgresOptions.host;
process.env.PGPORT = defaultPostgresOptions.port.toString();
process.env.PGDATABASE = defaultPostgresOptions.database;
process.env.PGUSERNAME = defaultPostgresOptions.username;
process.env.PGPASSWORD = defaultPostgresOptions.password;
