import type {Task} from '@feltcoop/gro';

import {obtainDb} from './obtainDb.js';

// name? maybe `init` or `reset` is clearer?

export interface TaskArgs {
	'no-seed'?: boolean;
}

export const task: Task = {
	description: 'create the database from scratch, deleting and seeding data',
	run: async ({invokeTask, args}) => {
		const shouldSeed = !args['no-seed'];
		const [_, unobtainDb] = obtainDb();
		await invokeTask('db/destroy');
		// await invokeTask('db/up'); // TODO add task that migrates up using `ley`
		if (shouldSeed) await invokeTask('db/seed');
		unobtainDb();
	},
};
