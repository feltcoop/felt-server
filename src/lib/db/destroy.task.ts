import type {Task} from '@feltcoop/gro';

import {obtain_db} from '$lib/db/obtain_db.js';
import {default_postgres_options} from '$lib/db/postgres.js';

export const task: Task = {
	summary: 'destroy the app database schema and delete all data',
	run: async () => {
		const [db, unobtain_db] = obtain_db();
		await db.sql.unsafe(`
			drop schema public cascade;
			create schema public;
			alter schema public owner to postgres;
			grant all on schema public to postgres;
			grant all on schema public to ${default_postgres_options.username};
			grant all on schema public to public;
		`);
		unobtain_db();
	},
};
