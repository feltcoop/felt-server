import type {Task} from '@feltcoop/gro';

import {MIGRATIONS_DIR} from '$lib/db/migrate.task';

// TODO handle production data dumps somehow

interface Args {
	// TODO count = 1
	checkpoint: boolean; // if `true`, do not run the final migrations that are being tested
}

export const task: Task<Args> = {
	summary: 'tests the most recent mogration file against the seeded database',
	run: async ({invokeTask, fs, args}) => {
		const {checkpoint = false} = args;

		// first move the latest migration temporarily out of `$lib/db/migrations`
		// and create the database with seeded data
		const TEMP_PATH = 'src/lib/db';
		const migrationFiles = await fs.readDir(MIGRATIONS_DIR);
		const latestMigrationFile = migrationFiles[migrationFiles.length - 1];
		await fs.move(
			`${MIGRATIONS_DIR}/${latestMigrationFile}`,
			`${TEMP_PATH}/${latestMigrationFile}`,
		);

		let err;
		try {
			await invokeTask('lib/db/create');
		} catch (_err) {
			err = _err;
		}

		// move the file back
		await fs.move(
			`${TEMP_PATH}/${latestMigrationFile}`,
			`${MIGRATIONS_DIR}/${latestMigrationFile}`,
		);

		// throw any error that occurred, but only after moving the file back
		if (err) throw err;

		if (!checkpoint) {
			await invokeTask('lib/db/migrate');
		}
	},
};
