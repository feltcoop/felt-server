import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';
import {DIST_DIRNAME} from '@feltcoop/gro/dist/paths.js';

import {DEPLOY_IP, DEPLOY_USER} from '$lib/config';

const deployLogin = `${DEPLOY_USER}@${DEPLOY_IP}`;

export const task: Task = {
	summary: 'deploy felt server to prod',
	dev: false,
	run: async ({invokeTask}) => {
		await invokeTask('clean');
		await invokeTask('build');
		let timestamp = Date.now();
		let artifactName = `felt_server_${timestamp}`;
		console.log(`Working with artifact: ${artifactName}`);
		await spawn('tar', [
			'-cvf',
			`${artifactName}.tar`,
			DIST_DIRNAME,
			'package.json',
			'package-lock.json',
		]);
		//scp to server
		//your ssh key will need to be added to linode account
		//TODO create server account for running system
		await spawn('scp', [`${artifactName}.tar`, `${deployLogin}:${artifactName}.tar`]);
		//unpack & start server
		await spawn('ssh', [
			deployLogin,
			`mkdir deploy_${artifactName};
			mv ${artifactName}.tar deploy_${artifactName}/;
			cd deploy_${artifactName};
			tar -xvf ${artifactName}.tar;
			npm i;
			cd ../;
			ln -sfn deploy_${artifactName}/ deploy_felt_server_current;`,
		]);
		//TEMP: move .env files into root
		await spawn('scp', [
			`src/infra/.env.default`,
			`${deployLogin}:deploy_felt_server_current/.env`,
		]);
		await spawn('scp', [
			`src/infra/.env.production.default`,
			`${deployLogin}:deploy_felt_server_current/.env.production`,
		]);
	},
};

// INSTALL A DB SOMEWHERE
// FIGURE OUT A GOOD 'seed' process
