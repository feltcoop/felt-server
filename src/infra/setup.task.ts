import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';

//TODO chage these to task params; source from seperate infra files
import {DEPLOY_IP, DEPLOY_USER, DEPLOY_SERVER_HOST, EMAIL_ADDRESS} from '$lib/config';

const deployLogin = `${DEPLOY_USER}@${DEPLOY_IP}`;

export const task: Task = {
	summary: 'setup a clean server to prepare for a felt-server deploy',
	dev: false,
	run: async ({}) => {
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
		await spawn('ssh', [
			deployLogin,
			`/root/.fnm/fnm install 16;
			apt install npm;`,
		]);
		//This chunk manages the NGINX & HTTPS config
		await spawn('ssh', [
			deployLogin,
			`apt install certbot;
			apt install python3-certbot-nginx;
		  apt -y install nginx;
			systemctl start nginx;
			sudo unlink /etc/nginx/sites-enabled/default;`,
		]);
		await spawn('scp', [
			`src/infra/felt-server.conf`,
			`${deployLogin}:/etc/nginx/sites-available/felt-server.conf`,
		]);
		// //TODO stuff is still a little unstable arount this
		// //Make sure youre DNS records are set up and configured first
		await spawn('ssh', [
			deployLogin,
			`ln -s /etc/nginx/sites-available/felt-server.conf /etc/nginx/sites-enabled/felt-server.conf;
			certbot --nginx --non-interactive --agree-tos --email ${EMAIL_ADDRESS} -d ${DEPLOY_SERVER_HOST}
			systemctl restart nginx.service;
			`,
		]);

		//TODO install postgres & initialize database
		//see lib/db/README for more details
	},
};
