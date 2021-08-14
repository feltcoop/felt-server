[<img src="src/static/felt.png" align="right" width="192" height="178">](https://felt.dev)

# felt-server

> server for [Felt](https://github.com/feltcoop/felt),
> a tool for building and maintaining communities 💚

Thanks for your interest in contributing! Before you get started you'll need to get your local machine set up.

## Getting Started

1. Configure your environment to the Node & NPM versions listed in [package.json](/package.json)
1. Run `npm i`
1. Install [Gro](https://github.com/feltcoop/gro)
   globally to [run tasks](https://github.com/feltcoop/gro/tree/main/src/task#readme):
   `npm i -g @feltcoop/gro`
1. [Install Postgresql](/src/lib/db/README.md)
1. Run `gro lib/db/create` to initialize the database'
1. Run `gro dev` and navigate to localhost:3000 to start!

> TODO deployment instructions
