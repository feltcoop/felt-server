import type {Task} from '@feltcoop/gro';
import ley from 'ley';
import {defaultPostgresOptions} from '$lib/db/postgres.js';

export const task: Task = {
	summary: 'running new migrations to bring database up to date',
	run: async () => {
		const status = await ley.status({
			dir: 'migrations',
			driver: 'postgres',
			config: defaultPostgresOptions as any,
		});

		console.log('the following migrations will be run: ', status);

		const successes = await ley.up({
			dir: 'migrations',
			driver: 'postgres',
			config: defaultPostgresOptions as any,
		});
		console.log('the following migrations were successful:', successes);
		if (successes.length != status.length) {
			console.error('not all pending migrations were applied, please double check');
		}
	},
};
