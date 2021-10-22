import postgres from 'postgres';

import {Database} from '$lib/db/Database';
import {defaultPostgresOptions} from '$lib/db/postgres';

export const db = new Database({sql: postgres(defaultPostgresOptions)});
