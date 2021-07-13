import {to_obtainable} from '@feltcoop/felt/util/obtainable.js';
import postgres from 'postgres';

import {default_postgres_options} from '$lib/db/postgres.js';
import {Database} from '$lib/db/Database.js';

export const obtain_db = to_obtainable(
	(): Database => new Database({sql: postgres(default_postgres_options)}),
	(db) => db.close(),
);
