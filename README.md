[<img src="src/static/felt.png" align="right" width="192" height="178">](https://felt.dev)

# felt-server

> server for [Felt](https://github.com/feltcoop/felt),
> a tool for building and maintaining communities 💚

> **work in progress**: pre-pre-alpha

For more in depth development docs, please see [Contributing](/src/lib/docs/contributing.md)

For build & deployment docs, please see the [Infra README](/src/infra/README.md)

## getting started

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

> learn more [about Gro](https://github.com/feltcoop/gro) and
> [setting up a dev environment](/src/lib/docs/contributing.md)

## credits 🐢<sub>🐢</sub><sub><sub>🐢</sub></sub>

[Polka](https://github.com/lukeed/polka) ∙
[Svelte](https://github.com/sveltejs/svelte) ∙
[SvelteKit](https://github.com/sveltejs/kit) ∙
[Vite](https://github.com/vitejs/vite) ∙
[Gro](https://github.com/feltcoop/gro) ∙
[Rollup](https://github.com/rollup/rollup) ∙
[TypeScript](https://github.com/microsoft/TypeScript) ∙
[esbuild](https://github.com/evanw/esbuild) ∙
[esinstall](https://github.com/snowpackjs/snowpack/tree/main/esinstall) ∙
[uvu](https://github.com/lukeed/uvu) ∙
[Ley](https://github.com/lukeed/ley) ∙
[Prettier](https://github.com/prettier/prettier) ∙
[@lukeed\/\*](https://github.com/lukeed)
& [more](package.json)

## license [🐦](https://en.wikipedia.org/wiki/Free_and_open-source_software)

[MIT](LICENSE)
