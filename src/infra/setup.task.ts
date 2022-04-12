import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';

import {fromEnv} from '$lib/server/env';
import {toNginxConfig} from './nginxConfig';

export const task: Task = {
	summary: 'setup a clean server to prepare for a felt-server deploy',
	production: true,
	run: async ({fs}) => {
		const DEPLOY_IP = fromEnv('DEPLOY_IP');
		const DEPLOY_USER = fromEnv('DEPLOY_USER');
		const VITE_DEPLOY_SERVER_HOST = fromEnv('VITE_DEPLOY_SERVER_HOST');
		const EMAIL_ADDRESS = fromEnv('EMAIL_ADDRESS');

		// TODO BLOCK how to detect and bail? maybe put hash
		// ~/.felt-initialized -- this file gets checked to see if the script has been run

		const deployLogin = `${DEPLOY_USER}@${DEPLOY_IP}`;
		//TODO set up initial user accounts & directory system
		//TODO break up commands for better error handling
		//Install initial tools for Node ecosystem
		await spawn('ssh', [
			deployLogin,
			`apt update;
			apt install unzip;			
		  curl -fsSL https://fnm.vercel.app/install | bash;`,
		]);
		//Splitting these tasks here let's fnm get picked up from the bash profile
		// TODO BLOCK npm
		await spawn('ssh', [
			deployLogin,
			`/root/.fnm/fnm install 16;
			apt install npm;
			npm install pm2@latest -g`,
		]);
		//This chunk manages the NGINX & HTTPS config
		await spawn('ssh', [
			deployLogin,
			`apt install -y certbot nginx python3-certbot-nginx;
			systemctl start nginx;
			sudo unlink /etc/nginx/sites-enabled/default;`,
		]);
		// TODO BLOCK do this without the hack
		const {API_SERVER_HOST_PROD, SVELTEKIT_SERVER_HOST} = await import('../lib/config');
		await fs.writeFile(
			'src/infra/felt-server.conf',
			toNginxConfig(
				fromEnv('VITE_DEPLOY_SERVER_HOST'),
				API_SERVER_HOST_PROD,
				SVELTEKIT_SERVER_HOST,
			),
		);
		await spawn('cat', [`src/infra/felt-server.conf`]);
		await spawn('scp', [
			`src/infra/felt-server.conf`,
			`${deployLogin}:/etc/nginx/sites-available/felt-server.conf`,
		]);
		// //TODO stuff is still a little unstable arount this
		// //Make sure youre DNS records are set up and configured first
		await spawn('ssh', [
			deployLogin,
			`ln -s /etc/nginx/sites-available/felt-server.conf /etc/nginx/sites-enabled/felt-server.conf;
			certbot --nginx --non-interactive --agree-tos --email ${EMAIL_ADDRESS} -d ${VITE_DEPLOY_SERVER_HOST}
			systemctl restart nginx.service;
			`,
		]);

		//TODO install postgres & initialize database
		//see lib/db/README for more details
		// TODO BLOCK do this
		// sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
		// curl -L https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
		// sudo apt update
		// sudo apt install -y postgresql
		// TODO BLOCK configure
		// sudo -u postgres psql
		// # in psql:
		// # postgres=#
		// create database felt; # notice the semicolon
		// \password
		// <enter "password">
	},
};
