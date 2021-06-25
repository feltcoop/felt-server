import type {Task} from '@feltcoop/gro/dist/task/task.js';
import {spawn_process} from '@feltcoop/felt/util/process.js';
import {DIST_DIRNAME} from '@feltcoop/gro/dist/paths.js';

export const task: Task = {
	summary: 'deploy felt server to prod',
	run: async ({}) => {
		//TODO - add more dynamic naming
		await spawn_process('tar', [
			'-cvf',
			'deploy.tar',
			DIST_DIRNAME,
			'package.json',
			'package-lock.json',
		]);
		//scp to server
		//your ssh key will need to be added to linode account
		await spawn_process('scp', ['deploy.tar', 'root@96.126.116.174:deploy.tar']);
		//unpack & start server
		await spawn_process('ssh', ['root@96.126.116.174', 'tar -xvf deploy.tar;', 'npm i;']);
	},
};

//Linode Ubuntu Initialization Steps
// sudo apt-get unzip
// curl -fsSL https://fnm.vercel.app/install | bash
// source /root/.bashrc
// fnm install 14.16.0
// sudo apt-get npm
