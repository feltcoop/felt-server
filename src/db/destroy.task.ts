import type {Task} from '@feltcoop/gro';

import {obtainSql} from './obtainSql.js';
import {getDbConnectionConfig} from './getDbConnectionConfig.js';

export const task: Task = {
	description: 'destroy the schema and delete all data',
	run: async () => {
		const [db, unobtainSql] = obtainSql();

		// We aren't using `down` migrations yet, if ever,
		// so we just recreate the db from scratch directly
		// instead of calling into db's migrate API.
		const config = getDbConnectionConfig();
		await db.raw(`
			DROP SCHEMA public CASCADE;
			CREATE SCHEMA public;
			ALTER SCHEMA public OWNER to postgres;
			GRANT ALL ON SCHEMA public TO postgres;
			GRANT ALL ON SCHEMA public TO ${config.user};
			GRANT ALL ON SCHEMA public TO public;
		`);

		unobtainSql();
	},
};
