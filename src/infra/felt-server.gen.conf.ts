import type {Gen} from '@feltcoop/gro/dist/gen/gen.js';

import {DEPLOY_SERVER_HOST, API_SERVER_HOST_PROD, SVELTEKIT_SERVER_HOST} from '$lib/config';
import {PINGER_INTERVAL} from '$lib/ui/pinger';

// Outputs an nginx config with configured values.
export const gen: Gen = async () => {
	const websocketTimeout = `${PINGER_INTERVAL / 1000 + 60}s`; // 60 second padding
	return `

server {
  server_name ${DEPLOY_SERVER_HOST};

  location /api {
    proxy_pass https://${API_SERVER_HOST_PROD};
  }

  location /ws {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_pass https://${API_SERVER_HOST_PROD};
    proxy_read_timeout ${websocketTimeout};
    proxy_send_timeout ${websocketTimeout};
  }

  location / {
    proxy_pass https://${SVELTEKIT_SERVER_HOST};
  }
}

  `.trim();
};
