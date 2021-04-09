const {typescript} = require('svelte-preprocess-esbuild');
const node = require('@sveltejs/adapter-node');
const pkg = require('./package.json');

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
	preprocess: typescript(), // TODO mdsvex
	kit: {
		adapter: node(),
		target: '#svelte',
		appDir: 'app', // import('@feltcoop/gro/dist/paths.js').SVELTE_KIT_APP_DIRNAME
		vite: {
			ssr: {
				noExternal: Object.keys(pkg.dependencies || {}),
			},
			server: {
				proxy: {
					'/api': 'http://localhost:3001/', // import('@feltcoop/gro/dist/config/defaultBuildConfig.js').API_SERVER_DEFAULT_PORT_DEV
				},
			},
		},
	},
};
