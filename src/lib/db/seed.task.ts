import type {Task} from '@feltcoop/gro';

import {obtainDb} from '$lib/db/obtainDb.js';
import {seed} from '$lib/db/seed.js';

export const task: Task = {
	summary: 'add initial dataset to the the database',
	run: async () => {
		const [db, unobtainDb] = obtainDb();
		await seed(db);
		unobtainDb(); // eslint-disable-line @typescript-eslint/no-floating-promises
	},
};
