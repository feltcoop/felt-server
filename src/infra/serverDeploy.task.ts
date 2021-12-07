import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';
import {DIST_DIRNAME} from '@feltcoop/gro/dist/paths.js';

export const task: Task = {
	summary: 'deploy felt server to prod',
	dev: false,
	run: async ({invokeTask, fs}) => {
		console.log('setting serverDeploy');
		//TODO gro dev workaround
		process.env.NODE_ENV = 'production';
		const {fromEnv} = await import('$lib/server/env');

		const DEPLOY_IP = fromEnv('DEPLOY_IP');
		const DEPLOY_USER = fromEnv('DEPLOY_USER');
		const deployLogin = `${DEPLOY_USER}@${DEPLOY_IP}`;
		const ENV_PROD = '.env.production';

		//set git version in the .env.production file
		const branch = (await fs.readFile('.git/HEAD', 'utf8')).trim().substring(5);
		const gitVersion = (await fs.readFile('.git/' + branch, 'utf8')).trim().substring(0, 7);

		const data = await fs.readFile(ENV_PROD, 'utf8');
		const result = data.replace(/VITE_GIT_VERSION=.*/g, `VITE_GIT_VERSION=${gitVersion}`);
		await fs.writeFile(ENV_PROD, result, 'utf8');

		//build the actual tar deployment artifact
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
		await spawn('scp', [ENV_PROD, `${deployLogin}:${currentDeploy}/${ENV_PROD}`]);
		//TODO: re/start the server via pm2
	},
};

// INSTALL A DB SOMEWHERE
// FIGURE OUT A GOOD 'seed' process
