import type {Task} from '@feltcoop/gro';

import {obtainDb} from './obtainDb.js';

// name? maybe `init` or `reset` is clearer?

export interface TaskArgs {
	'no-seed'?: boolean;
	S?: boolean; // alias for `no-seed`
}

export const task: Task = {
	description: 'create the database from scratch and reset all data',
	run: async ({invokeTask, args}) => {
		const shouldSeed = !(args['no-seed'] || args.S);
		const [_, unobtainDb] = obtainDb();
		await invokeTask('db/destroy');
		await invokeTask('db/up');
		if (shouldSeed) await invokeTask('db/seed');
		unobtainDb();
	},
};
