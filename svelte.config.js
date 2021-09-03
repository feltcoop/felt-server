import {typescript} from 'svelte-preprocess-esbuild';
import node from '@sveltejs/adapter-node';
import dotenv from 'dotenv';

dotenv.config();

/** @type {import('@sveltejs/kit').Config} */
export default {
	preprocess: typescript(),
	compilerOptions: {
		immutable: true,
	},
	kit: {
		adapter: node(),
		target: '#root',
		files: {assets: 'src/static'},
		vite: {
			server: {
				proxy: {
					'/api': `http://${process.env.API_SERVER_HOST}`,
				},
			},
			optimizeDeps: {
				exclude: ['@feltcoop/felt'],
			},
		},
	},
};
