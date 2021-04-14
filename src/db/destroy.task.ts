import type {Task} from '@feltcoop/gro';

import {obtainDb} from './obtainDb.js';
import {defaultPostgresOptions} from './postgres.js';

export const task: Task = {
	description: 'destroy the schema and delete all data',
	run: async () => {
		const [db, unobtainDb] = obtainDb();

		await db.sql.unsafe(`
			DROP SCHEMA public CASCADE;
			CREATE SCHEMA public;
			ALTER SCHEMA public OWNER to postgres;
			GRANT ALL ON SCHEMA public TO postgres;
			GRANT ALL ON SCHEMA public TO ${defaultPostgresOptions.username};
			GRANT ALL ON SCHEMA public TO public;
		`);

		unobtainDb();
	},
};
