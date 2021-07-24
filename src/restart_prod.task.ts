import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';

export const task: Task = {
	summary: 'restart felt prod server',
	dev: false,
	run: async ({}) => {
		await spawn('ssh', [
			'root@96.126.116.174',
			`kill $(ps aux | grep 'node' | awk '{print $2}');
      node deploy_felt_server_current/dist/server/lib/server/server.js &`,
		]);
	},
};
