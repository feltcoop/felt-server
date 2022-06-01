# Building and deploying felt-server

> how to go from a [local dev setup](/src/docs/getting-started.md) to a live deployment

These documents and tools were built with the assumption of remote cloud infrastructure,
but can easily be adapted for local use & deployment.

To start, clone the repo locally and make sure
[Gro](https://github.com/feltcoop/gro) is installed globally:

```bash
git clone https://github.com/feltcoop/felt-server
npm i -g @feltcoop/gro
```

## initializing

Before building & deploying, a fresh instance of Linux needs to be configured.
We currently use Ubuntu 22.04 (LTS) x64.

## database

You will either need to set up a managed database or set it up to run
in parallel with the server. See the [database README](src/lib/db/README.md) for more

Make sure you have run the most up to date database migrations with

```bash
gro lib/db/migrate
```

## build

Build the `dist/` directory for production:

```bash
npm run build
# or
gro build

# run it
npm start
# or
gro start
# TODO support custom port, like:
PORT=3003 gro start
```

## deploy

To self-host on a VPS:

Create `.env.production` at the root of a cloned instance
of this repo with the appropriate values filled in.
For an example with default values see
[`src/infra/.env.production.default`](/src/infra/.env.production.default).
Be sure to change the secrets/keys and host!

Then:

```bash
gro infra/setup
gro infra/serverDeploy
# TODO automate all of this
# manually setup the database user/password
# manually run `gro lib/db/migrate` from a cloned instance of felt-server
# manually run `pm2 start npm -- run start --prefix ~/current_felt_server_deploy`
```

> Deploy will execute a build on the local machine, package the output into a tar, and attempt to deploy it to a remote instance:

```bash
# TODO this currently doesn't work, but could probably be streamlined to:
npm run deploy
# or
gro deploy
```

## redeploy

```bash
gro infra/restartProd
```

## manually upgrading cloud instances

If upgrading your underlying cloud OS,
we recommend spinning up a new server instance and restoring a DB backup to it.
This helps keeps cruft from forming on your servers,
helps you make sure you running on the latest hardware from your cloud provider,
and tests your DB restoration process all in one.

1. Spin up a new server with the new OS
1. Point your DNS record to the new IP
1. Run `infra/setup` on the new server
1. Set up your DB password
1. Use [`pg_dump`](https://www.postgresql.org/docs/current/backup-dump.html)
   to get a copy of the DB from your old server instance
1. Copy that dump from old to new server & restore it
1. Deploy the latest `felt-server` code to your new server
1. Restart
