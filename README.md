# felt-server

[<img src="src/static/felt.png" align="right" width="192" height="178">](https://felt.dev)

> server for [Felt](https://github.com/feltcoop/felt),
> a tool for building and maintaining communities 💚 work in progress

## usage

```bash
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

> learn more [about Gro](https://github.com/feltcoop/gro)

Each part of the dev build is available as an npm script:

```bash
npm run dev-sveltekit
npm run dev-gro
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

> TODO

# :turtle:<sub>:turtle:</sub><sub><sub>:turtle:</sub></sub>

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
[Prettier](https://github.com/prettier/prettier) ∙
[@lukeed\/\*](https://github.com/lukeed)
& [more](package.json)

## license 🐦

[MIT](LICENSE)
