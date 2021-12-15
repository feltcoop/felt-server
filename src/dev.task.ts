import type {Task} from '@feltcoop/gro';

// TODO maybe do this via a config plugin instead of task override?
export const task: Task = {
	summary: 'dev',
	run: async ({invokeTask}) => {
		await invokeTask('infra/updateEnv');
		await invokeTask('gro/dev');
	},
};
