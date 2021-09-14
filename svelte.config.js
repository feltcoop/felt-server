import {typescript} from 'svelte-preprocess-esbuild';
import node from '@sveltejs/adapter-node';
import dotenv from 'dotenv';
import {readFileSync} from 'fs';

const {
	development: {API_SERVER_HOST},
} = JSON.parse(readFileSync('./src/lib/config.json', 'utf8'));

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
