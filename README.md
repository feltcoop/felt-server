# gro-template-sveltekit-polka

> work in progress

## usage

> tip: did you know about the "Use this template" button above? (if you're logged in)

> are you lost? go to [nodejs.org](https://nodejs.org)

```bash
npx degit ryanatkn/gro-template-sveltekit-polka#main cooltoy
cd cooltoy
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

> why [`degit`](https://github.com/Rich-Harris/degit)?

Each part of the dev build is available as an npm script:

```bash
npm run dev-sveltekit
npm run dev-gro
```

> hint: `gg` is a fine alias for [`gro dev`](https://github.com/feltcoop/gro)

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

## template

- [SvelteKit](https://github.com/sveltejs/kit)
- [Polka](https://github.com/lukeed/polka)
- [Gro](https://github.com/feltcoop/gro)

# :turtle:<sub>:turtle:</sub><sub><sub>:turtle:</sub></sub>

[Svelte](https://github.com/sveltejs/svelte) ∙
[Vite](https://github.com/vitejs/vite) ∙
[Rollup](https://github.com/rollup/rollup) ∙
[TypeScript](https://github.com/microsoft/TypeScript) ∙
[esbuild](https://github.com/evanw/esbuild) ∙
[esinstall](https://github.com/snowpackjs/snowpack/tree/main/esinstall) ∙
[uvu](https://github.com/lukeed/uvu) ∙
[Prettier](https://github.com/prettier/prettier) ∙
[@lukeed\/\*](https://github.com/lukeed)
& [more](package.json)

# [🐦](https://en.wikipedia.org/wiki/Free_and_open-source_software)
