/* 

public domain (The Unlicense)
https://github.com/porsager/postgres

supported options:

host            : '',         // Postgres ip address[s] or domain name[s]
port            : 5432,       // Postgres server port[s]
path            : '',         // unix socket path (usually '/tmp')
database        : '',         // Name of database to connect to
username        : '',         // Username of database user
password        : '',         // Password of database user
ssl             : false,      // true, prefer, require, tls.connect options
max             : 10,         // Max number of connections
idle_timeout    : 0,          // Idle connection timeout in seconds
connect_timeout : 30,         // Connect timeout in seconds
no_prepare      : false,      // No automatic creation of prepared statements
types           : [],         // Array of custom types, see more below
onnotice        : fn          // Defaults to console.log
onparameter     : fn          // (key, value) when server param change
debug           : fn          // Is called with (connection, query, params)
transform       : {
  column            : fn, // Transforms incoming column names
  value             : fn, // Transforms incoming row values
  row               : fn  // Transforms entire rows
},
connection      : {
  application_name  : 'postgres.js', // Default application_name
  ...                                // Other connection parameters
},
target_session_attrs : null   // Use 'read-write' with multiple hosts to 
                              // ensure only connecting to primary

supported env vars mapped to options:

host 	PGHOST
port 	PGPORT
database 	PGDATABASE
username 	PGUSERNAME or PGUSER
password 	PGPASSWORD
idle_timeout 	PGIDLE_TIMEOUT
connect_timeout 	PGCONNECT_TIMEOUT

*/

import type {Sql, Options} from 'postgres';

export type PostgresSql = Sql<PostgresTypeMap>;
export type PostgresOptions = Options<PostgresTypeMap>;
// TODO use this somehow - will need refactoring
export type PostgresTypeMap = Record<string, unknown>;
