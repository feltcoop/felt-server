import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';
import {DIST_DIRNAME} from '@feltcoop/gro/dist/paths.js';

export interface TaskArgs {
	user: string;
	ip: string;
	env: string;
}

export const task: Task<TaskArgs> = {
	summary: 'deploy felt server to prod',
	dev: false,
	run: async ({invokeTask, args}) => {
		console.log(args);
		const {user, ip, env = 'src/infra/.env.production.default'} = args;
		const deployLogin = `${user}@${ip}`;
		await invokeTask('clean');
		await invokeTask('build');
		let timestamp = Date.now();
		let artifactName = `felt_server_${timestamp}`;
		let currentDeploy = `current_felt_server_deploy`;
		console.log(`Working with artifact: ${artifactName}`);
		await spawn('tar', [
			'-cvf',
			`${artifactName}.tar`,
			DIST_DIRNAME,
			'package.json',
			'package-lock.json',
		]);
		//clean up any previous deploy directorys (except the current one)
		await spawn('ssh', [
			deployLogin,
			`ls -t | grep deploy_felt_server_[0-9] | tail -n +2 | xargs rm -r --`,
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
			ln -sfn deploy_${artifactName}/ ${currentDeploy};`,
		]);
		//TEMP: move .env files into root
		await spawn('scp', [`src/infra/.env.default`, `${deployLogin}:${currentDeploy}/.env`]);
		await spawn('scp', [`${env}`, `${deployLogin}:${currentDeploy}/.env.production`]);
		//TODO: re/start the server via pm2
	},
};

// INSTALL A DB SOMEWHERE
// FIGURE OUT A GOOD 'seed' process
