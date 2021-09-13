import type {Gen} from '@feltcoop/gro/dist/gen/gen.js';

// TODO fix gro :|
// import {SERVER_HOST, API_SERVER_HOST, SVELTEKIT_SERVER_HOST} from '$lib/constants.js';

export const SERVER_HOST = 'felt.dev';
export const SVELTEKIT_SERVER_HOST = 'localhost:3000';
export const API_SERVER_HOST = 'localhost:3001';

// Outputs an nginx config with custom values.
export const gen: Gen = async () => {
	// TODO source these from config and extend in user projects
	const serverName = SERVER_HOST;
	const serverUrl = API_SERVER_HOST;
	// TODO delete this var after switching to the `adapter-node` middleware
	const staticServerUrl = SVELTEKIT_SERVER_HOST;
	return `

server {
  server_name ${serverName};

  location /api {
    proxy_pass http://${serverUrl};
  }

  location /ws {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_pass http://${serverUrl};
  }

  location / {
    proxy_pass http://${staticServerUrl};
  }
}

  `.trim();
};
