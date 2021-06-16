# felt-server/db

## tech

- [PostgreSQL](https://www.postgresql.org)
- [`postgres`](https://github.com/porsager/postgres)

## postgres setup

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
host = PGHOST or 'localhost'
port = PGPORT or 5432
idle_timeout = PGIDLE_TIMEOUT
connect_timeout = PGCONNECT_TIMEOUT
```

To set up the database with the expected defaults:

```bash
sudo -u postgres psql
# in psql:
# postgres=#
create database felt; # notice the semicolon
\password
<enter "password">
```

> TODO figure out config, maybe through `src/gro.config.ts`

## database tasks

Felt has a number of [Gro](https://github.com/feltcoop/gro) tasks for managing the database.
To view all of them, run `gro db`.

### db/create

The task `gro db/create` creates the database from scratch.
It destroys any existing schema and data, runs all migrations (TODO), and seeds the database.

```bash
gro db/create
gro db/create --no-seed # creates the database with no initial data
```

The tasks it composes can be run individually:

- `gro db/destroy`
- `gro db/seed`
