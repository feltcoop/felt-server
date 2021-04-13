import type {Task} from '@feltcoop/gro';
import ley from 'ley';

import {obtainSql} from './obtainSql.js';
import {getMigrationConfigWithCustomSource} from './getDbMigrationConfig.js';

export const task: Task = {
	description: 'run all migrations',
	run: async () => {
		const [db, unobtainSql] = obtainSql();

		const migrationConfig = getMigrationConfigWithCustomSource();

		await ley.up(migrationConfig);

		unobtainSql();
	},
};
