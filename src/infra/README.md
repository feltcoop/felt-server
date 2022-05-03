# Building and deploying felt-server

> how to go from a [local dev setup](/src/docs/getting-started.md) to a live deployment

These documents and tools were built with the assumption of remote cloud infrastructure,
but can easily be adapted for local use & deployment.

To start, clone the repo locally and make sure
[Gro](https://github.com/feltcoop/gro) is installed globally.

## initializing

Before building & deploying, a fresh instance of Linux needs to be configured.
We currently use Ubuntu 20.04 (LTS) x64

Update your [config](src/lib/config.js) and replace the placeholder values with your target info,
then run

```bash
gro gen
gro infra/setup
```

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

> Deploy will execute a build on the local machine, package the output into a tar, and attempt to deploy it to a remote instance:

```bash
npm run deploy
# or
gro deploy

# TODO support custom deployment URLs
```
