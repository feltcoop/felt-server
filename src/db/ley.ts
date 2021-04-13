import type {Driver} from 'ley';

export interface LeyOptions {
	cwd?: string;
	dir?: string;
	driver?: string | Driver;
}

export const LEY_CWD = 'src/db/migrations';

export const toDefaultLeyOptions = (): LeyOptions => ({
	cwd: LEY_CWD,
	dir: LEY_DIR,
	driver: 'postgres',
});
