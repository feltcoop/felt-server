import {typescript} from 'svelte-preprocess-esbuild';
import node from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: typescript(),
	kit: {
		adapter: node(),
		target: '#root',
		files: {assets: 'src/static'},
		vite: {
			server: {
				proxy: {
					'/api': 'http://localhost:3001/', // import('@feltcoop/gro/dist/config/defaultBuildConfig.js').API_SERVER_DEFAULT_PORT_DEV
				},
			},
			optimizeDeps: {
				exclude: ['@feltcoop/felt'],
			},
		},
	},
};
