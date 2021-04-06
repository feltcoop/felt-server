# felt-server/db

## tech

- [PostgreSQL](https://www.postgresql.org)
- [`postgres`](https://github.com/porsager/postgres)

## postgres

Felt's database driver is [`postgres`](https://github.com/porsager/postgres).
See its docs to learn more.

At the moment, the server [defaults to connecting](../db/postgres.ts)
to the database `'felt'` as `'postgres'` with password `'password'`.
It prioritizes the following environment variables if they're defined:

```
host = PGHOST
port = PGPORT
database = PGDATABASE
username = PGUSERNAME or PGUSER
password = PGPASSWORD
idle_timeout = PGIDLE_TIMEOUT
connect_timeout = PGCONNECT_TIMEOUT
```
