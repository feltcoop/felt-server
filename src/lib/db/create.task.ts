import type {Task} from '@feltcoop/gro';

import {obtain_db} from '$lib/db/obtain_db.js';

// name? maybe `init` or `reset` is clearer?

export interface TaskArgs {
	'no-seed'?: boolean;
	seed?: boolean; // defaults to `true`
}

export const task: Task<TaskArgs> = {
	summary: 'create the database from scratch, deleting and seeding data',
	run: async ({invokeTask, args}) => {
		const {seed = true} = args;
		const [_, unobtain_db] = obtain_db();
		await invokeTask('lib/db/destroy');
		// await invokeTask('lib/db/up'); // TODO add task that migrates up using `ley`
		if (seed) await invokeTask('lib/db/seed');
		unobtain_db();
	},
};
