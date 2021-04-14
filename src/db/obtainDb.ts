import {createObtainable} from '@feltcoop/gro/dist/utils/obtainable.js';
import postgres from 'postgres';

import {defaultPostgresOptions} from './postgres.js';
import {Database} from './Database.js';

export const obtainDb = createObtainable(
	(): Database => new Database({sql: postgres(defaultPostgresOptions)}),
	(db) => db.close(),
);
