import type {Task} from '@feltcoop/gro';

import {DbTestMigrationTaskArgsSchema} from '$lib/db/testMigration/testMigrationTask.schema';
import {type DbTestMigrationTaskArgs} from '$lib/db/testMigration/testMigrationTask';
import {MIGRATIONS_DIR} from '$lib/db/migration';

export const task: Task<DbTestMigrationTaskArgs> = {
	summary: 'tests the most recent mogration file against the seeded database',
	args: DbTestMigrationTaskArgsSchema,
	run: async ({invokeTask, fs, args}) => {
		const {checkpoint = false, count = 1} = args;

		// First move the skipped migration files temporarily out of the migration dir
		// and create the database with seeded data.
		const TEMP_PATH = 'src/lib/db';
		const migrationFiles = (await fs.readDir(MIGRATIONS_DIR)).sort();
		const migrationFilesToSkip = migrationFiles.slice(-1 * count);
		await Promise.all(
			migrationFilesToSkip.map((file) =>
				fs.move(`${MIGRATIONS_DIR}/${file}`, `${TEMP_PATH}/${file}`),
			),
		);

		let err;
		try {
			await invokeTask('lib/db/create');
		} catch (_err) {
			err = _err;
		}

		// Move the files back.
		await Promise.all(
			migrationFilesToSkip.map((file) =>
				fs.move(`${TEMP_PATH}/${file}`, `${MIGRATIONS_DIR}/${file}`),
			),
		);

		// Throw any error that occurred, but only after moving the file back.
		if (err) throw err;

		if (!checkpoint) {
			await invokeTask('lib/db/migrate');
		}
	},
};
