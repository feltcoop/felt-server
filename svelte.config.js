import {typescript} from 'svelte-preprocess-esbuild';
import node from '@sveltejs/adapter-node';
import dotenv from 'dotenv';

import {API_SERVER_HOST} from './src/lib/constants.js';

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
					'/api': `http://${API_SERVER_HOST}`,
				},
			},
			optimizeDeps: {
				exclude: ['@feltcoop/felt'],
			},
		},
	},
};
