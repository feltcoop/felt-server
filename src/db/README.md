# felt-server/db

## tech

- [PostgreSQL](https://www.postgresql.org)
- [`postgres`](https://github.com/porsager/postgres)

## postgres

The Felt server has a dependency on [PostgreSQL](https://www.postgresql.org).
Please see its website for setup instructions.

> TODO what minimum supported version?

Felt's database driver is [`postgres`](https://github.com/porsager/postgres).
See its docs to learn more.

At the moment, the server [defaults to connecting](../db/postgres.ts)
to the database with the following values,
prioritizing environment variables if they're defined:

```
host = PGHOST
port = PGPORT
database = PGDATABASE or 'felt'
username = PGUSERNAME or PGUSER or 'postgres'
password = PGPASSWORD or 'password'
idle_timeout = PGIDLE_TIMEOUT
connect_timeout = PGCONNECT_TIMEOUT
```

> TODO figure out config, maybe through `src/gro.config.ts`
