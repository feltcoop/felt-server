// this is a JS file so it can be imported by `svelte.config.js`

// TODO This module is going to change significantly:
// - figure out how to allow user projects to override these vars
// - it should not be imported on the client, instead the values should be replaced at build time

// TODO Replace this at buildtime with a constant so it can be optimized.
// This probably means supporting `import.meta.env` or `$app/env` in Gro.

const dev = import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production';
export const VITE_DEPLOY_SERVER_HOST = dev
	? 'localhost'
	: import.meta.env
	? import.meta.env.VITE_DEPLOY_SERVER_HOST
	: process.env.VITE_DEPLOY_SERVER_HOST;

export const VITE_GIT_HASH = import.meta.env
	? import.meta.env.VITE_GIT_HASH
	: process.env.VITE_GIT_HASH;

export const SVELTEKIT_SERVER_HOST = 'localhost:3000';
export const API_SERVER_PORT_DEV = 3001;
export const API_SERVER_PORT_PROD = 3000;
export const API_SERVER_PORT = dev ? API_SERVER_PORT_DEV : API_SERVER_PORT_PROD; // TODO maybe use `process.env.PORT`?
export const API_SERVER_HOST_DEV = `localhost:${API_SERVER_PORT_DEV}`;
export const API_SERVER_HOST_PROD = `localhost:${API_SERVER_PORT_PROD}`;
export const API_SERVER_HOST = dev ? API_SERVER_HOST_DEV : API_SERVER_HOST_PROD;
export const WEBSOCKET_URL_DEV = `ws://localhost:${API_SERVER_PORT_DEV}/ws`;
export const WEBSOCKET_URL_PROD = `wss://${VITE_DEPLOY_SERVER_HOST}/ws`;
export const WEBSOCKET_URL = dev ? WEBSOCKET_URL_DEV : WEBSOCKET_URL_PROD;
