import type {Driver} from 'ley';

// ley: driver agnostic database migrations
// https://github.com/lukeed/ley

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

export const toLeyUpOptions = (single = false) => ({...toDefaultLeyOptions(), single});
