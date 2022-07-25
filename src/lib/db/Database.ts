import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import type {PostgresSql} from '$lib/db/postgres.js';
import {Repos} from '$lib/db/Repos';

export interface Options {
	sql: PostgresSql;
}

export class Database {
	sql: PostgresSql;
	repos: Repos;

	log = new Logger(gray('[') + blue('db') + gray(']'));

	constructor({sql}: Options) {
		this.log.info('create');
		this.sql = sql;
		this.repos = new Repos(sql);
	}

	async close(): Promise<void> {
		this.log.info('close');
		await this.sql.end();
	}
}
