import type {Database} from '$lib/db/Database';

export class PostgresRepo {
	constructor(public readonly db: Database) {}
}
