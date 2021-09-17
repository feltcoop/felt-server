import type {Task} from '@feltcoop/gro';
import {TaskError} from '@feltcoop/gro';
import {spawn, printSpawnResult} from '@feltcoop/felt/util/process.js';

export const task: Task = {
	summary: 'typecheck the project without emitting any files',
	run: async ({invokeTask}) => {
		await invokeTask('gro/typecheck');
		const svelteCheckResult = await spawn('npx', ['svelte-check']);
		if (!svelteCheckResult.ok) {
			throw new TaskError(`Failed to typecheck Svelte. ${printSpawnResult(svelteCheckResult)}`);
		}
	},
};
