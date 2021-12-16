import type {Task} from '@feltcoop/gro';

export const task: Task = {
	summary: 'start dev server',
	run: async ({invokeTask}) => {
		await invokeTask('infra/updateEnv');
		await invokeTask('gro/dev');
	},
};
