import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';

export const task: Task = {
	summary: 'restart felt prod server',
	dev: false,
	run: async () => {
		//TODO gro dev workaround
		process.env.NODE_ENV = 'production';
		const {fromEnv} = await import('$lib/server/env');

		const DEPLOY_IP = fromEnv('DEPLOY_IP');
		const DEPLOY_USER = fromEnv('DEPLOY_USER');
		const deployLogin = `${DEPLOY_USER}@${DEPLOY_IP}`;

		await spawn('ssh', [
			deployLogin,
			`cd current_felt_server_deploy;
			export NODE_ENV=production && pm2 start npm -- run start`,
		]);
	},
};
