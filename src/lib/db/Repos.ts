import type {PostgresSql} from '$lib/db/postgres';
import {SessionRepo} from '$lib/session/SessionRepo';
import {AccountRepo} from '$lib/vocab/account/AccountRepo';
import {PersonaRepo} from '$lib/vocab/persona/PersonaRepo';
import {MembershipRepo} from '$lib/vocab/membership/MembershipRepo';
import {CommunityRepo} from '$lib/vocab/community/CommunityRepo';
import {SpaceRepo} from '$lib/vocab/space/SpaceRepo';
import {EntityRepo} from '$lib/vocab/entity/EntityRepo';
import {TieRepo} from '$lib/vocab/tie/TieRepo';

/**
 * The `Repos` is instantiated with a `postgres.Sql` instance,
 * which can be a normal connection or transaction.
 */
export class Repos {
	session: SessionRepo;
	account: AccountRepo;
	persona: PersonaRepo;
	membership: MembershipRepo;
	community: CommunityRepo;
	space: SpaceRepo;
	entity: EntityRepo;
	tie: TieRepo;

	constructor(sql: PostgresSql) {
		this.session = new SessionRepo(this, sql);
		this.account = new AccountRepo(this, sql);
		this.persona = new PersonaRepo(this, sql);
		this.membership = new MembershipRepo(this, sql);
		this.community = new CommunityRepo(this, sql);
		this.space = new SpaceRepo(this, sql);
		this.entity = new EntityRepo(this, sql);
		this.tie = new TieRepo(this, sql);
	}
}
