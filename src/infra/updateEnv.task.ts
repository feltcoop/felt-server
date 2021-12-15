import type {Task} from '@feltcoop/gro';
import {ENV_DEV, ENV_PROD, updateEnv} from '$lib/server/env';

export const task: Task = {
	summary: 'write git hash to the appropriate environment variables file',
	run: async ({fs, log, dev}) => {
		const envFile = dev ? ENV_DEV : ENV_PROD;
		const branch = (await fs.readFile('.git/HEAD', 'utf8')).trim().substring(5);
		const [gitHashContents, currentEnvContents] = await Promise.all([
			fs.readFile('.git/' + branch, 'utf8'),
			fs.readFile(envFile, 'utf8'),
		]);
		const gitHash = gitHashContents.trim().substring(0, 7);
		const updatedEnvContents = updateEnv(currentEnvContents, 'VITE_GIT_HASH', gitHash);
		if (currentEnvContents !== updatedEnvContents) {
			log.info(`writing updated git hash ${gitHash} to ${envFile}`);
			await fs.writeFile(envFile, updatedEnvContents, 'utf8');
		}
	},
};
