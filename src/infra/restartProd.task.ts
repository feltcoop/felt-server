import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';

import {DEPLOY_IP, DEPLOY_USER} from '$lib/constants';

const deployLogin = `${DEPLOY_USER}@${DEPLOY_IP}`;

export const task: Task = {
	summary: 'restart felt prod server',
	dev: false,
	run: async ({}) => {
		await spawn('ssh', [
			deployLogin,
			`kill $(ps aux | grep 'node' | awk '{print $2}');
      node deploy_felt_server_current/dist/server/lib/server/server.js &;`,
		]);
	},
};
