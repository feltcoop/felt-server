import type {Task} from '@feltcoop/gro';

// TODO what behavior should this do? do we want a flag to not do anything further,
// so we can run queries against the current data?

interface Args {
	run?: boolean;
	'no-run'?: boolean;
}

export const task: Task<Args> = {
	summary: 'tests the most recent mogration file against the seeded database',
	run: async ({invokeTask, fs, args}) => {
		const {run = true} = args;

		// first move the latest migration temporarily out of `$lib/db/migrations`
		// and create the database with seeded data
		const path = 'src/lib/db/migrations';
		const migrationFiles = await fs.readDir(path);
		const latestMigrationFile = migrationFiles[migrationFiles.length - 1];
		console.log('migrationFiles', latestMigrationFile);
		const tempPath = 'src/lib/db';
		await fs.move(`${path}/${latestMigrationFile}`, `${tempPath}/${latestMigrationFile}`);

		let err;
		try {
			await invokeTask('lib/db/create');
		} catch (_err) {
			err = _err;
		}

		// move the file back
		await fs.move(`${tempPath}/${latestMigrationFile}`, `${path}/${latestMigrationFile}`);

		// throw any error that occurred, but only after moving the file back
		if (err) throw err;

		if (run) {
			await invokeTask('lib/db/migrate');
		}
	},
};
