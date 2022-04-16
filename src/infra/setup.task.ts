import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';
import {green, red} from 'kleur/colors';

import {fromEnv} from '$lib/server/env';
import {toNginxConfig} from './nginxConfig';
import {toLogSequence} from './helpers';
import type {SetupTaskArgs} from './setupTask';
import {SetupTaskArgsSchema} from './setupTask.schema';

export const task: Task<SetupTaskArgs> = {
	summary: 'setup a clean server to prepare for a felt-server deploy',
	production: true,
	args: SetupTaskArgsSchema,
	run: async ({log, args: {dry}}) => {
		const DEPLOY_IP = fromEnv('DEPLOY_IP');
		const DEPLOY_USER = fromEnv('DEPLOY_USER');
		const VITE_DEPLOY_SERVER_HOST = fromEnv('VITE_DEPLOY_SERVER_HOST');
		const EMAIL_ADDRESS = fromEnv('EMAIL_ADDRESS');

		// TODO this is hacky because of `import.meta` env handling
		const {API_SERVER_HOST_PROD, SVELTEKIT_SERVER_HOST} = await import('../lib/config.js');

		const REMOTE_NGINX_CONFIG_PATH = '/etc/nginx/sites-available/felt-server.conf';
		const REMOTE_NGINX_SYMLINK_PATH = '/etc/nginx/sites-enabled/felt-server.conf';
		const nginxConfig = toNginxConfig(
			fromEnv('VITE_DEPLOY_SERVER_HOST'),
			API_SERVER_HOST_PROD,
			SVELTEKIT_SERVER_HOST,
		);

		// This file is used to detect if the setup script has already run.
		const FELT_SETUP_STATE_FILE_PATH = '~/felt_state_setup';

		const deployLogin = `${DEPLOY_USER}@${DEPLOY_IP}`;

		const logSequence = toLogSequence();

		//TODO set up initial user accounts & directory system

		//Install initial tools for Node ecosystem
		const steps: string[] = [
			deployLogin,
			logSequence('Setting up server instance...') +
				//
				//
				// Configure shell behavior:
				// 	-e — exit the script if any command returns a nonzero exit code
				// 	-u — throw an error if nonexistent variables are accessed
				'set -eu;\n\n' +
				// Ensure the setup task has not already run on this instance:
				logSequence(`Checking setup state at ${FELT_SETUP_STATE_FILE_PATH}`) +
				`if [ -f ${FELT_SETUP_STATE_FILE_PATH} ]; then
					echo '${red('Felt setup task has already run on this instance, exiting without changes')}'
					exit 1
				fi;
				touch ${FELT_SETUP_STATE_FILE_PATH};`,
			//
			//
			// Update and upgrade apt
			logSequence('Updating apt...') +
				`apt update;
				apt upgrade -y;`,
			//
			//
			// Install fnm:
			logSequence('Installing fnm...') +
				`apt install -y unzip;
				curl -fsSL https://fnm.vercel.app/install | bash;
				export PATH=/root/.fnm:$PATH;
				eval "\`fnm env\`";`,
			//
			//
			// Install Node:
			logSequence('Installing Node...') +
				`fnm install 16;
				fnm use 16;
				fnm default 16;
				npm i -g npm@latest;`,
			//
			//
			// Install Node tools:
			logSequence('Installing pm2 and gro...') + `npm i -g pm2 @feltcoop/gro;`,
			//
			//
			// Install nginx & certbot for HTTPS:
			logSequence('Installing nginx and certbot...') +
				`apt install -y nginx certbot python3-certbot-nginx;
				systemctl start nginx;
				sudo unlink /etc/nginx/sites-enabled/default;`,
			//
			//
			// Create the nginx config:
			logSequence('Creating nginx config...') +
				`touch ${REMOTE_NGINX_CONFIG_PATH};
				echo '${nginxConfig}' >> ${REMOTE_NGINX_CONFIG_PATH};
				cat ${REMOTE_NGINX_CONFIG_PATH};`,
			//
			//
			//Make sure your DNS records are set up and configured first
			//TODO stuff is still a little unstable arount this
			logSequence('Enabling HTTPS with cerbot and nginx...') +
				`ln -s ${REMOTE_NGINX_CONFIG_PATH} ${REMOTE_NGINX_SYMLINK_PATH};
				certbot --nginx --non-interactive --agree-tos --email ${EMAIL_ADDRESS} -d ${VITE_DEPLOY_SERVER_HOST};
				systemctl restart nginx.service;`,
			//
			//
			// Install Postgres:
			// More details at src/lib/db/README.md and https://www.postgresql.org/download/linux/ubuntu/
			logSequence('Installing Postgres...') +
				`sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list;'
				curl -L https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -;
				sudo apt update;
				sudo apt install -y postgresql;`,
			//
			//
			// All done!
			logSequence(`Success! Server is now setup for deployment.`),
			// TODO initialize the database
			// sudo -u postgres psql
			// # in psql:
			// # postgres=#
			// create database felt; # notice the semicolon
			// \password
			// <enter "password">
		].map((s) => s + '\n\n');
		if (dry) {
			log.info(green(`\n\ndry run! here's the script ↓\n\n`), 'ssh ' + steps.join(''));
			log.info(green('\n\ndry run done ↑\n\n'));
			return;
		}
		const result = await spawn('ssh', steps);
		if (!result.ok) {
			if (result.signal) log.error('spawn failed with signal', result.signal);
			throw Error('Failed setup task');
		}
	},
};
