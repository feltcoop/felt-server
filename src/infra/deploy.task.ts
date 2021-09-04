import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';
import {DIST_DIRNAME} from '@feltcoop/gro/dist/paths.js';

import {DEPLOY_IP, DEPLOY_USER} from '$lib/constants';

const deployLogin = `${DEPLOY_USER}@${DEPLOY_IP}`;

export const task: Task = {
	summary: 'deploy felt server to prod',
	dev: false,
	run: async ({invokeTask}) => {
		await invokeTask('clean');
		await invokeTask('build');
		let timestamp = Date.now();
		let artifact_name = `felt_server_${timestamp}`;
		console.log(`Working with artifact: ${artifact_name}`);
		await spawn('tar', [
			'-cvf',
			`${artifact_name}.tar`,
			DIST_DIRNAME,
			'package.json',
			'package-lock.json',
		]);
		//scp to server
		//your ssh key will need to be added to linode account
		//TODO create server account for running system
		await spawn('scp', [`${artifact_name}.tar`, `${deployLogin}:${artifact_name}.tar`]);
		//unpack & start server
		await spawn('ssh', [
			deployLogin,
			`mkdir deploy_${artifact_name};
			mv ${artifact_name}.tar deploy_${artifact_name}/;
			cd deploy_${artifact_name};
			tar -xvf ${artifact_name}.tar;
			npm i;
			cd ../;
			ln -sfn deploy_${artifact_name}/ deploy_felt_server_current;`,
		]);
	},
};

// INSTALL A DB SOMEWHERE
// FIGURE OUT A GOOD 'seed' process
