// generated by src/lib/db/testMigration/testMigrationTask.schema.ts

export interface DbTestMigrationTaskArgs {
	/**
	 * if `true`, does not run the `count` number of final migrations
	 */
	checkpoint?: boolean;
	/**
	 * number of migrations being tested; rarely might need more than 1
	 */
	count?: number;
}

// generated by src/lib/db/testMigration/testMigrationTask.schema.ts
