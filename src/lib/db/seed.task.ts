import type {Task} from '@feltcoop/gro';

import {obtain_db} from '$lib/db/obtain_db.js';
import {seed} from '$lib/db/seed.js';

export const task: Task = {
	summary: 'add initial dataset to the the database',
	run: async () => {
		const [db, unobtain_db] = obtain_db();
		await seed(db);
		unobtain_db();
	},
};
