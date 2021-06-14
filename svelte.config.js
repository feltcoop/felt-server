import {typescript} from 'svelte-preprocess-esbuild';
import node from '@sveltejs/adapter-node';
import {readFileSync} from 'fs';

const pkg = JSON.parse(readFileSync(new URL('package.json', import.meta.url), 'utf8'));

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: typescript(), // TODO mdsvex
	kit: {
		adapter: node(),
		target: '#svelte',
		files: {assets: 'src/static'},
		vite: {
			ssr: {
				noExternal: Object.keys(pkg.dependencies || {}),
			},
			server: {
				proxy: {
					'/api': 'http://localhost:3001/', // import('@feltcoop/gro/dist/config/defaultBuildConfig.js').API_SERVER_DEFAULT_PORT_DEV
					// TODO what's the right way to configure this?
					// '/ws': 'ws://localhost:3002/',
					// '/ws': 'ws://localhost:3001/',
					// 'ws://localhost:3000': 'ws://localhost:3002/',
					// 'ws://localhost:3000': 'ws://localhost:3001/',
				},
			},
		},
	},
};
