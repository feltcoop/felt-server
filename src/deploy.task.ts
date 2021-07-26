import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';
import {DIST_DIRNAME} from '@feltcoop/gro/dist/paths.js';

export const task: Task = {
	summary: 'deploy felt server to prod',
	dev: false,
	run: async ({invoke_task}) => {
		await invoke_task('clean');
		await invoke_task('build');
		//TODO - Investigate why this is only returning 3 digits when called.
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
		//TODO extract IP to env var
		//TODO create server account for running system
		await spawn('scp', [`${artifact_name}.tar`, `root@96.126.116.174:${artifact_name}.tar`]);
		//unpack & start server
		await spawn('ssh', [
			'root@96.126.116.174',
			`mkdir deploy_${artifact_name};
			mv ${artifact_name}.tar deploy_${artifact_name}/;
			cd deploy_${artifact_name};
			tar -xvf ${artifact_name}.tar;`,
			//npm i;
			//ln -sf ${artifact_name}/ deploy_felt_server_current;`,
		]);

		//await invoke_task('restart_prod');
	},
};

//Linode Ubuntu Initialization Steps
// sudo apt-get unzip
// curl -fsSL https://fnm.vercel.app/install | bash
// source /root/.bashrc
// fnm install 14.16.0
// sudo apt-get npm

// NOTES ON NGINX & HTTPS
// apt-get install python3-certbot-nginx
// sudo apt -y install nginx
// systemctl start nginx
// sudo unlink /etc/nginx/sites-enabled/default
// >> copy configured nginx file here to /etc/nginx/sites-available/felt-server.conf
// server {
//  server_name staging.felt.dev;
//	listen 80;
//
//	location /api/ {
//			proxy_pass http://localhost:3001;
//
//	}
//
//	location / {
//			proxy_pass http://localhost:3000;
//	}
//}
// >> symlink ln -s /etc/nginx/sites-available/felt-server.conf /etc/nginx/sites-enabled/felt-server.conf
// restart nginx

// INSTALL A DB SOMEWHERE
// FIGURE OUT A GOOD 'seed' process
