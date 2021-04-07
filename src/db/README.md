# felt-server/db

## tech

- [PostgreSQL](https://www.postgresql.org)
- [`postgres`](https://github.com/porsager/postgres)

## postgres

The Felt server has a dependency on [PostgreSQL](https://www.postgresql.org) 13.2+.
You can find [setup instructions](https://www.postgresql.org/download/) on their website.

Felt's database driver is [`postgres`](https://github.com/porsager/postgres).
See its [README](https://github.com/porsager/postgres#readme) to learn more.

At the moment, the server [defaults to connecting](./postgres.ts)
to the database with the following values,
prioritizing environment variables if they're defined:

```
database = PGDATABASE or 'felt'
username = PGUSERNAME or PGUSER or 'postgres'
password = PGPASSWORD or 'password'
host = PGHOST
port = PGPORT
idle_timeout = PGIDLE_TIMEOUT
connect_timeout = PGCONNECT_TIMEOUT
```

> TODO figure out config, maybe through `src/gro.config.ts`
