import type {Gen} from '@feltcoop/gro/dist/gen/gen.js';

import config from '$lib/config.json';

const {
	production: {DEPLOY_SERVER_HOST, API_SERVER_HOST, SVELTEKIT_SERVER_HOST},
} = config;

// Outputs an nginx config with custom values.
export const gen: Gen = async (/*{config}*/) => {
	// TODO source these from config (see ^^ -- and extend in user projects)
	return `

server {
  server_name ${DEPLOY_SERVER_HOST};

  location /api {
    proxy_pass http://${API_SERVER_HOST};
  }

  location /ws {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_pass http://${API_SERVER_HOST};
  }

  location / {
    proxy_pass http://${SVELTEKIT_SERVER_HOST};
  }
}

  `.trim();
};
