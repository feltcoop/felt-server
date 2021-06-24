import type {Task} from '@feltcoop/gro';

import {obtainDb} from './obtainDb.js';

// name? maybe `init` or `reset` is clearer?

export interface TaskArgs {
	'no-seed'?: boolean;
}

export const task: Task = {
	summary: 'create the database from scratch, deleting and seeding data',
	run: async ({invoke_task, args}) => {
		const shouldSeed = !args['no-seed'];
		const [_, unobtainDb] = obtainDb();
		await invoke_task('db/destroy');
		// await invoke_task('db/up'); // TODO add task that migrates up using `ley`
		if (shouldSeed) await invoke_task('db/seed');
		unobtainDb();
	},
};
