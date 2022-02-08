import type {Task} from '@feltcoop/gro';
import {type DevTaskArgs} from '@feltcoop/gro/dist/dev.js';
import {DevTaskArgsSchema} from '@feltcoop/gro/dist/dev.schema.js';

export const task: Task<DevTaskArgs> = {
	summary: 'start dev server',
	args: DevTaskArgsSchema,
	run: async ({invokeTask}) => {
		await invokeTask('infra/updateEnv');
		await invokeTask('gro/dev');
	},
};
