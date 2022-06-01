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
		// TODO env vars are currently messy with 3 strategies:
		// 1 - calling `fromEnv('VAR')`
		// 2 - defaults setup by `$lib/config.js`
		// 3 - defaults setup by `$lib/db/postgres`
		const DEPLOY_IP = fromEnv('DEPLOY_IP');
		const DEPLOY_USER = fromEnv('DEPLOY_USER');
		const VITE_DEPLOY_SERVER_HOST = fromEnv('VITE_DEPLOY_SERVER_HOST');
		const EMAIL_ADDRESS = fromEnv('EMAIL_ADDRESS');
		// TODO this is hacky because of `import.meta` env handling
		const {API_SERVER_HOST_PROD, SVELTEKIT_SERVER_HOST} = await import('../lib/config.js');
		// TODO hacky -- see notes above
		const {defaultPostgresOptions} = await import('../lib/db/postgres.js');
		const PGDATABASE = defaultPostgresOptions.database;
		// const PGUSERNAME = defaultPostgresOptions.username; // TODO setup db user+password -- see below
		// const PGPASSWORD = defaultPostgresOptions.password; // TODO setup db user+password -- see below

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
				echo 'export PATH='$PATH'
				  eval "\`fnm env\`"
				  '$(cat ~/.bashrc) > ~/.bashrc;
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
			logSequence('Installing pm2 and gro...') +
				`export NODE_ENV=production;
				echo "export NODE_ENV=production" >> ~/.profile;
				echo "export NODE_ENV=production
				  $(cat ~/.bashrc)" > ~/.bashrc;
				npm i -g pm2 @feltcoop/gro;`,
			//
			//
			// Install nginx:
			logSequence('Installing nginx...') +
				`apt install -y nginx;
				sudo unlink /etc/nginx/sites-enabled/default;
				touch ${REMOTE_NGINX_CONFIG_PATH};
				echo '${nginxConfig}' >> ${REMOTE_NGINX_CONFIG_PATH};
				cat ${REMOTE_NGINX_CONFIG_PATH};
				ln -s ${REMOTE_NGINX_CONFIG_PATH} ${REMOTE_NGINX_SYMLINK_PATH};
				systemctl start nginx;`,
			//
			//
			// Install certbot for HTTPS:
			logSequence('Enabling HTTPS with cerbot and nginx...') +
				`apt install -y certbot python3-certbot-nginx;
				certbot --nginx --non-interactive --agree-tos --email ${EMAIL_ADDRESS} -d ${VITE_DEPLOY_SERVER_HOST};
				systemctl restart nginx.service;`,
			//
			//
			// Install Postgres:
			// More details at src/lib/db/README.md and https://www.postgresql.org/download/linux/ubuntu/
			logSequence('Installing Postgres...') +
				`sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list;';
				curl -L https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -;
				sudo apt update;
				sudo apt install -y postgresql;`,
			//
			//
			// Create the Postgres database for Felt:
			logSequence('Creating Postgres database...') +
				`sudo -i -u postgres psql -c "CREATE DATABASE ${PGDATABASE};";` +
				// TODO create the custom db user (the following code does not work):
				// `sudo -i -u postgres psql -U postgres -c "CREATE USER ${PGUSERNAME} WITH LOGIN PASSWORD '${PGPASSWORD}';";` +
				// `PGPASSWORD=${PGPASSWORD} sudo -i -u postgres psql -U ${PGUSERNAME} -c "CREATE DATABASE ${PGDATABASE};";` +
				//
				//
				// All done!
				logSequence(`Success! Server is now setup for deployment.`),
		];
		const script = steps.map((s) => s + '\n\n').join('');
		if (dry) {
			log.info(green(`\n\ndry run! here's the script ↓\n\n`), `ssh ${deployLogin} ${script}`);
			log.info(green('\n\ndry run done ↑\n\n'));
			return;
		}
		const result = await spawn('ssh', [deployLogin, script]);
		if (!result.ok) {
			if (result.signal) log.error('spawn failed with signal', result.signal);
			throw Error('Failed setup task');
		}

		// TODO streamline the deployment, also see `/src/infra/README.md` and the above DB setup TODO
		// await invokeTask('infra/serverDeploy');
	},
};
