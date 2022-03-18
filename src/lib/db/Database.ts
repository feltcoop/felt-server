import type {PostgresSql} from '$lib/db/postgres.js';
import {SessionRepo} from '$lib/session/SessionRepo';
import {AccountRepo} from '$lib/vocab/account/AccountRepo';
import {PersonaRepo} from '$lib/vocab/persona/PersonaRepo';
import {MembershipRepo} from '$lib/vocab/membership/MembershipRepo';
import {CommunityRepo} from '$lib/vocab/community/CommunityRepo';
import {SpaceRepo} from '$lib/vocab/space/SpaceRepo';
import {EntityRepo} from '$lib/vocab/entity/EntityRepo';
import {TieRepo} from '$lib/vocab/tie/TieRepo';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

export interface Options {
	sql: PostgresSql;
}

export class Database {
	sql: PostgresSql;

	log = new Logger(gray('[') + blue('db') + gray(']'));

	constructor({sql}: Options) {
		this.log.info('create');
		this.sql = sql;
	}

	async close(): Promise<void> {
		this.log.info('close');
		await this.sql.end();
	}

	// TODO refactor
	repos = {
		session: new SessionRepo(this),
		account: new AccountRepo(this),
		persona: new PersonaRepo(this),
		membership: new MembershipRepo(this),
		community: new CommunityRepo(this),
		space: new SpaceRepo(this),
		entity: new EntityRepo(this),
		tie: new TieRepo(this),
	};
}
