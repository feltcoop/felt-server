import type {Task} from '@feltcoop/gro';

import {obtainDb} from '$lib/db/obtainDb.js';

// name? maybe `init` or `reset` is clearer?

export interface TaskArgs {
	'no-seed'?: boolean;
	seed?: boolean; // defaults to `true`
}

export const task: Task<TaskArgs> = {
	summary: 'create the database from scratch, deleting and seeding data',
	run: async ({invokeTask, args}) => {
		const {seed = true} = args;
		const [_, unobtainDb] = obtainDb();
		await invokeTask('lib/db/destroy');
		await invokeTask('lib/db/migrate');
		if (seed) await invokeTask('lib/db/seed');
		unobtainDb();
	},
};
