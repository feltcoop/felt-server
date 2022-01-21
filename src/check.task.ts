import type {Task} from '@feltcoop/gro';

import {MIGRATIONS_DIR, toMigrationIndex} from '$lib/db/migration';

export const task: Task = {
	summary: 'runs gro check with additional checks for this repo',
	run: async ({invokeTask, fs}) => {
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

		// Perform default checks.
		await invokeTask('gro/check');
	},
};
