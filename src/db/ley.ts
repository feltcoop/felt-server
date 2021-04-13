import type {Driver} from 'ley';

export interface LeyOptions {
	cwd?: string;
	dir?: string;
	driver?: string | Driver;
}

// TODO where should this go? construct with `DB_DIRNAME`?
export const MIGRATIONS_DIR = `src/db/migrations`;

export const toDefaultLeyOptions = (): LeyOptions => ({
	// cwd: '.',
	dir: MIGRATIONS_DIR,
	driver: 'postgres',
});
