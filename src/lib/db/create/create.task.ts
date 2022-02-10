import type {Task} from '@feltcoop/gro';

import {DbCreateTaskArgsSchema} from '$lib/db/create/createTask.schema';
import {type DbCreateTaskArgs} from '$lib/db/create/createTask';
import {obtainDb} from '$lib/db/obtainDb.js';

export const task: Task<DbCreateTaskArgs> = {
	summary: 'create the database from scratch, deleting and seeding data',
	args: DbCreateTaskArgsSchema,
	run: async ({invokeTask, args}) => {
		const {seed = true} = args;
		const [_, unobtainDb] = obtainDb();
		await invokeTask('lib/db/destroy');
		await invokeTask('lib/db/migrate');
		if (seed) await invokeTask('lib/db/seed');
		unobtainDb();
	},
};
