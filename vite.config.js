import {sveltekit} from '@sveltejs/kit/vite';

import {API_SERVER_HOST} from './src/lib/config.js';

/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	server: {
		port: 3000,
		proxy: {
			'/api': `http://${API_SERVER_HOST}`,
		},
	},
};

export default config;
