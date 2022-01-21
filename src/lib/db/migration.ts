import {stripAfter} from '@feltcoop/felt/util/string.js';

export const MIGRATIONS_DIR = 'src/lib/db/migrations';

/**
 * Extracts the numerical index of the given migraiton file name,
 * of the form `00000-some-migration-name.ext`.
 * Handles any number of prefixed zeros.
 * @param file
 */
export const toMigrationIndex = (file: string): number => Number(stripAfter(file, '-'));
