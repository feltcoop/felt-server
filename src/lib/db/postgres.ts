import type {Sql, Options} from 'postgres';
import {to_env_number, to_env_string} from '@feltcoop/felt/util/env.js';

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

const to_default_postgres_options = (): PostgresOptions => ({
	host: to_env_string('PGHOST', 'localhost'),
	port: to_env_number('PGPORT', 5432),
	database: to_env_string('PGDATABASE', 'felt'),
	username: to_env_string('PGUSERNAME', to_env_string('PGUSER', 'postgres')),
	password: to_env_string('PGPASSWORD', 'password'),
	idle_timeout: to_env_number('PGIDLE_TIMEOUT'),
	connect_timeout: to_env_number('PGCONNECT_TIMEOUT'),
});

export const default_postgres_options = to_default_postgres_options();

// update `process.env` so tools like `ley` see our values
// TODO maybe add a flag to the `toEnv` APIs to set the value if it's undefined (set as a string!)
process.env.PGHOST = default_postgres_options.host;
process.env.PGPORT = default_postgres_options.port.toString();
process.env.PGDATABASE = default_postgres_options.database;
process.env.PGUSERNAME = default_postgres_options.username;
process.env.PGPASSWORD = default_postgres_options.password;
