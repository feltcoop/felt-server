import {createObtainable} from '@feltcoop/gro/dist/utils/obtainable.js';
import postgres from 'postgres';

import {getKnexConnectionConfig} from './getKnexConnectionConfig.js';

export type KnexInstance = createKnex<any, unknown[]>;

export const obtainKnex = createObtainable(
	(): KnexInstance => {
		sql = postgres(toDefaultPostgresOptions());
		const knex = createKnex({
			client: 'pg',
			connection: getKnexConnectionConfig(),
			pool: {
				min: 2,
				max: 10,
			},
			migrations: {
				tableName: 'knex_migrations',
			},
		});
		return knex;
	},
	(knex) => knex.destroy(),
);
