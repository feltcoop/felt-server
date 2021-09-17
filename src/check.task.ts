import type {Task} from '@feltcoop/gro';
import {spawn} from '@feltcoop/felt/util/process.js';

export const task: Task = {
	summary: 'check that everything is ready to commit',
	run: async ({invokeTask}) => {
		await invokeTask('gro/check');
		await spawn('npx', ['svelte-check']); // TODO why is `npx` needed here?
	},
};
