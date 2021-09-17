import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';

export const task: Task = {
	summary: 'typecheck everything',
	run: async ({invokeTask}) => {
		await invokeTask('gro/typecheck');
		await spawn('npx', ['svelte-check']);
	},
};
