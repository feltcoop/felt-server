import type {Sql, Options} from 'postgres';

export type PostgresSql = Sql<PostgresTypeMap>;

export type PostgresOptions = Options<PostgresTypeMap>;

// TODO use this to pass through custom types
export type PostgresTypeMap = Record<string, unknown>;
