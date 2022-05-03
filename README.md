[<img src="src/static/felt.png" align="right" width="192" height="178">](https://felt.dev)

# felt-server

> server for [Felt](https://github.com/feltcoop/felt),
> a tool for building and maintaining communities 💚

> **work in progress**: pre-alpha

For more in depth development docs, please see
[Getting started](/src/docs/getting-started.md) and
[Contributing](/contributing.md)

For build & deployment docs, see the [Infra README](/src/infra/README.md)

## getting started

First [setup for dev](/src/docs/getting-started.md), then:

```bash
# node >=16.6
npm i

# start the SvelteKit/Vite frontend dev build, Node builds with Gro, and Polka API server
npm run dev

# browse to localhost:3000

# you can also run `gro dev` with Gro installed globally: npm i -g @feltcoop/gro
gro dev # args are forwarded to `svelte-kit` like `npm run dev`
gro # print available tasks

npm test
# or
gro test
```

> learn more [about Gro](https://github.com/feltcoop/gro),
> [setting up a dev environment](/src/docs/getting-started.md),
> and [contributing](/contributing.md)

## credits 🐢<sub>🐢</sub><sub><sub>🐢</sub></sub>

[Polka](https://github.com/lukeed/polka) ∙
[Svelte](https://github.com/sveltejs/svelte) ∙
[SvelteKit](https://github.com/sveltejs/kit) ∙
[Vite](https://github.com/vitejs/vite) ∙
[TypeScript](https://github.com/microsoft/TypeScript) ∙
[uvu](https://github.com/lukeed/uvu) ∙
[Postgres.js](https://github.com/porsager/postgres) ∙
[Ley](https://github.com/lukeed/ley) ∙
[Gro](https://github.com/feltcoop/gro) ∙
[Felt](https://github.com/feltcoop/felt) ∙
[ESLint](https://github.com/eslint/eslint) ∙
[Prettier](https://github.com/prettier/prettier)
& [more](package.json)

## license [🐦](https://en.wikipedia.org/wiki/Free_and_open-source_software)

[MIT](LICENSE)
