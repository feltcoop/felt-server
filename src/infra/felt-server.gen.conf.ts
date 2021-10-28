import type {Gen} from '@feltcoop/gro/dist/gen/gen.js';

import {DEPLOY_SERVER_HOST, API_SERVER_HOST_PROD, SVELTEKIT_SERVER_HOST} from '$lib/config';

// Outputs an nginx config with configured values.
export const gen: Gen = async () => {
	return `

server {
  server_name ${DEPLOY_SERVER_HOST};

  location /api {
    proxy_pass http://${API_SERVER_HOST_PROD};
  }

  location /ws {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_pass http://${API_SERVER_HOST_PROD};
  }

  location / {
    proxy_pass http://${SVELTEKIT_SERVER_HOST};
  }
}

  `.trim();
};
