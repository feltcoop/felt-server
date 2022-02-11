import {type Task} from '@feltcoop/gro';

import {MIGRATIONS_DIR, toMigrationIndex} from '$lib/db/migration';
import {type CheckTaskArgs} from './checkTask';
import {CheckTaskArgsSchema} from './checkTask.schema';

export const task: Task<CheckTaskArgs> = {
	summary: 'runs gro check with additional checks for this repo',
	args: CheckTaskArgsSchema,
	run: async ({invokeTask, fs, args, log}) => {
		const {migrations = true, 'no-migrations': noMigrations, ...restArgs} = args;

		if (migrations) {
			log.info('checking migrations');
			// Check migration files are properly numbered.
			const migrationFiles = (await fs.readDir(MIGRATIONS_DIR)).sort();
			for (let i = 0; i < migrationFiles.length; i++) {
				const migrationFile = migrationFiles[i];
				const migrationIndex = toMigrationIndex(migrationFile);
				if (i !== migrationIndex) {
					throw Error(
						'Migration named index does not match its directory index.' +
							` Expected index '${i}' but got '${migrationIndex}' for file ${migrationFile}`,
					);
				}
			}
		}

		// Perform default checks.
		await invokeTask('gro/check', restArgs);
	},
};
