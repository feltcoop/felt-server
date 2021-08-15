import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';

export const task: Task = {
	summary: 'setup a clean server to prepare for a felt-server deploy',
	dev: false,
	run: async ({}) => {
		//TODO set up initial user accounts & directory syste
		//Install initial tools for Node ecosystem
		await spawn('ssh', [
			'root@50.116.30.248',
			`apt update;
			apt install unzip;
      curl -fsSL https://fnm.vercel.app/install | bash;`,
		]);
		//Splitting these tasks here let's fnm get picked up from the bash profile
		await spawn('ssh', ['root@50.116.30.248', `fnm install 16;`]);
		//This chunk manages the NGINX & HTTPS config
		await spawn('ssh', [
			'root@50.116.30.248',
			`apt install certbot;
			apt install python3-certbot-nginx;
		  apt -y install nginx;
			systemctl start nginx;
			sudo unlink /etc/nginx/sites-enabled/default;`,
		]);
		await spawn('scp', [
			`src/infra/felt-server.conf`,
			`root@50.116.30.248:/etc/nginx/sites-available/felt-server.conf`,
		]);
		await spawn('ssh', [
			'root@50.116.30.248',
			`ln -s /etc/nginx/sites-available/felt-server.conf /etc/nginx/sites-enabled/felt-server.conf;
			certbot --nginx -d example.com -d www.example.com
			systemctl restart nginx.server;
			`,
		]);

		//TODO install postgres & initialize database
	},
};
