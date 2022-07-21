import type {PostgresSql} from '$lib/db/postgres';
import type {Repos} from '$lib/db/Repos';

export class PostgresRepo {
	constructor(public readonly repos: Repos, public readonly sql: PostgresSql) {}
}
