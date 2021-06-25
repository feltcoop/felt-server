import {to_obtainable} from '@feltcoop/felt/util/obtainable.js';
import postgres from 'postgres';

import {defaultPostgresOptions} from './postgres.js';
import {Database} from './Database.js';

export const obtainDb = to_obtainable(
	(): Database => new Database({sql: postgres(defaultPostgresOptions)}),
	(db) => db.close(),
);
