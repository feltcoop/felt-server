import type {Task} from '@feltcoop/gro';

import {obtainDb} from './obtainDb.js';
import {seed} from './seed.js';

export const task: Task = {
	summary: 'add initial dataset to the the database',
	run: async () => {
		const [db, unobtainDb] = obtainDb();
		await seed(db);
		unobtainDb();
	},
};
