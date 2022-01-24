import type {Task} from '@feltcoop/gro';

import {MIGRATIONS_DIR} from '$lib/db/migration';

// TODO handle production data dumps somehow

interface Args {
	checkpoint: boolean; // if `true`, does not run the `count` number of final migrations
	count: number; // defaults to 1; number of migrations being tested; rarely might need more
}

export const task: Task<Args> = {
	summary: 'tests the most recent mogration file against the seeded database',
	run: async ({invokeTask, fs, args}) => {
		const {checkpoint = false, count = 1} = args;

		// First move the skipped migration files temporarily out of the migration dir
		// and create the database with seeded data.
		const TEMP_PATH = 'src/lib/db';
		const migrationFiles = (await fs.readDir(MIGRATIONS_DIR)).sort();
		const migrationFilesToSkip = migrationFiles.slice(-1 * count);
		for (const file of migrationFilesToSkip) {
			await fs.move(`${MIGRATIONS_DIR}/${file}`, `${TEMP_PATH}/${file}`);
		}

		let err;
		try {
			await invokeTask('lib/db/create');
		} catch (_err) {
			err = _err;
		}

		// Move the files back.
		for (const file of migrationFilesToSkip) {
			await fs.move(`${TEMP_PATH}/${file}`, `${MIGRATIONS_DIR}/${file}`);
		}

		// Throw any error that occurred, but only after moving the file back.
		if (err) throw err;

		if (!checkpoint) {
			await invokeTask('lib/db/migrate');
		}
	},
};
