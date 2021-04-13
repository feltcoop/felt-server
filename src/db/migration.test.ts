import type {Task} from '@feltcoop/gro';
import {printPath} from '@feltcoop/gro/dist/utils/print.js';

import {obtainSql} from './obtainSql.js';
import {getMigrationConfigWithDefaultSource} from './getDbMigrationConfig.js';

export const task: Task = {
	description: 'create a new migration',
	run: async ({log, args}) => {
		const {
			_: [migrationName],
		} = args;
		if (!migrationName) {
			throw Error('Task "migration" requires a migration name argument: `gro migration <name>`.');
		}
		if (typeof migrationName !== 'string') {
			throw Error(
				`Migration name should be a string not ${typeof migrationName}, "${migrationName}".`,
			);
		}

		const [sql, unobtainSql] = obtainSql();

		const migratorConfig = getMigrationConfigWithDefaultSource();

		ley.new();

		const newMigrationPath = await ley.migrate.make(migrationName, migratorConfig);
		log.info('created migration', printPath(newMigrationPath));

		unobtainSql();
	},
};
