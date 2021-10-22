import type {Task} from '@feltcoop/gro';
import ley from 'ley';
import {defaultPostgresOptions} from '$lib/db/postgres.js';

export const task: Task = {
	summary: 'running new migrations to bring database up to date',
	run: async ({log}) => {
		const status = await ley.status({
			dir: 'src/lib/db/migrations',
			driver: 'postgres',
			config: defaultPostgresOptions as any,
		});

		log.info('the following migrations will be run: ', status);

		const successes = await ley.up({
			dir: 'src/lib/db/migrations',
			driver: 'postgres',
			config: defaultPostgresOptions as any,
		});
		log.info('the following migrations were successful:', successes);
		if (successes.length != status.length) {
			throw Error('not all pending migrations were applied, please double check');
		}
	},
};
