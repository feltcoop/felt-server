// this is a JS file so it can be imported by `svelte.config.js`

// TODO figure out how to allow user projects to override these vars

const dev = import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production';

export const SVELTEKIT_SERVER_HOST = 'localhost:3000';
export const API_SERVER_HOST = 'localhost:3001';
export const WEBSOCKET_URL = dev ? 'ws://localhost:3001/ws' : 'wss://staging.felt.dev/ws';

export const DEPLOY_SERVER_HOST = 'felt.dev';
export const DEPLOY_IP = '50.116.30.248';
export const DEPLOY_USER = 'root';
