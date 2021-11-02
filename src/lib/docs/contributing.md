[<img src="/src/static/felt.png" align="right" width="192" height="178">](https://felt.dev)

# felt-server

> server for [Felt](https://github.com/feltcoop/felt),
> a tool for building and maintaining communities 💚

Thanks for your interest in contributing! Before you get started you'll need to get your local machine set up.

## Getting Started

1. Configure your environment to the Node & NPM versions listed in [package.json](/package.json)
1. Run `npm i`
1. Install [Gro](https://github.com/feltcoop/gro)
   globally to [run tasks](https://github.com/feltcoop/gro/tree/main/src/docs/task.md):
   `npm i -g @feltcoop/gro`
1. [Install Postgresql](/src/lib/db/README.md)
1. Run `gro lib/db/create` to initialize the database'
1. Run [`gro dev`](https://github.com/feltcoop/gro/blob/main/src/docs/dev.md)
   and navigate to localhost:3000 to start!

## Developing

In most cases [`gro dev`](https://github.com/feltcoop/gro/blob/main/src/docs/dev.md)
is the only command you'll need to run during development.
It starts both SvelteKit and an API server,
and when files change the system should automatically update or restart as needed.

## manual processes

There's two manual steps that you may sometimes need to perform:

### `gro format`

Gro integrates formatting with [Prettier](https://github.com/prettier/prettier).
[This project's CI](/.github/workflows/check.yml)
runs `gro check` which runs `gro format --check` which fails if any files are unformatted.
You can manually format the project with `gro format`, and if you're using VSCode,
[the Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
combined with the setting `"editor.formatOnSave": true`
should take care of formatting automatically.

### `gro gen`

Gro provides the [`gro gen`](https://github.com/feltcoop/gro/blob/main/src/docs/gen.md)
task to make it easier to derive data and other files from single sources of truth.
It currently has a limitation where it does not run automatically;
the developer is expected to run `gro gen` when things change.
Making this process automatic is next on
[`gro gen`'s TODO list](https://github.com/feltcoop/gro/blob/main/src/docs/gen.md#todo),
but it's a tricky system to design without surprising performance implications.

[This project's CI](/.github/workflows/check.yml)
runs `gro check` which runs `gro gen --check` which fails if any generated files have changed,
to help ensure that the committed files remain in sync.

> The files that `gro gen` outputs are formatted automatically when possible,
> so there's no need to get things perfect.

## Building

The [`gro build`](https://github.com/feltcoop/gro/blob/main/src/docs/build.md) command
outputs artifacts to the gitignored `/dist` directory,
which can then deployed to production and published to a package registry like npm.
For SvelteKit projects, `gro build` wraps `svelte-kit build`,
and it also produces directories for each of
[Gro's configured production builds](https://github.com/feltcoop/gro/blob/main/src/docs/config.md).
See [Gro's build docs](https://github.com/feltcoop/gro/blob/main/src/docs/build.md) for more.

## Deploying

> TODO deployment instructions
