import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';

export interface TaskArgs {
	user: string;
	ip: string;
}

export const task: Task<TaskArgs> = {
	summary: 'restart felt prod server',
	dev: false,
	run: async ({args}) => {
		const {user, ip} = args;
		const deployLogin = `${user}@${ip}`;

		await spawn('ssh', [
			deployLogin,
			`kill $(ps aux | grep 'node' | awk '{print $2}');
      node deploy_felt_server_current/dist/server/lib/server/server.js &;`,
		]);
	},
};
