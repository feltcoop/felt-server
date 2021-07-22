import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';
import {DIST_DIRNAME} from '@feltcoop/gro/dist/paths.js';

export const task: Task = {
	summary: 'deploy felt server to prod',
	dev: false,
	run: async ({invoke_task}) => {
		await invoke_task('build');
		//TODO - add more dynamic naming
		await spawn('tar', ['-cvf', 'deploy.tar', DIST_DIRNAME, 'package.json', 'package-lock.json']);
		//scp to server
		//your ssh key will need to be added to linode account
		await spawn('scp', ['deploy.tar', 'root@96.126.116.174:deploy.tar']);
		//unpack & start server
		await spawn('ssh', ['root@96.126.116.174', 'tar -xvf deploy.tar;', 'npm i;']);
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
