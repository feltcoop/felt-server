import type {PostgresSql} from '$lib/db/postgres.js';
import {sessionRepo} from '$lib/session/sessionRepo';
import {accountRepo} from '$lib/vocab/account/accountRepo';
import {personaRepo} from '$lib/vocab/persona/personaRepo';
import {membershipRepo} from '$lib/vocab/membership/membershipRepo';
import {communityRepo} from '$lib/vocab/community/communityRepo';
import {spaceRepo} from '$lib/vocab/space/spaceRepo';
import {entityRepo} from '$lib/vocab/entity/entityRepo';
import {tieRepo} from '$lib/vocab/tie/tieRepo';

export interface Options {
	sql: PostgresSql;
}

export class Database {
	sql: PostgresSql;

	constructor({sql}: Options) {
		console.log('[db] create');
		this.sql = sql;
	}

	async close(): Promise<void> {
		console.log('[db] close');
		await this.sql.end();
	}

	// TODO refactor
	repos = {
		session: sessionRepo(this),
		account: accountRepo(this),
		persona: personaRepo(this),
		membership: membershipRepo(this),
		community: communityRepo(this),
		space: spaceRepo(this),
		entity: entityRepo(this),
		tie: tieRepo(this),
	};
}
