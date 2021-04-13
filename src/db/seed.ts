import type {ApiServer} from 'src/server/ApiServer';

export const seed = async (server: ApiServer): Promise<void> => {
	const {db} = server;
	const {sql} = db;

	console.log('[seed] adding initial dataset to database');

	// example: create table
	const createAccountsTableResult = await sql`
  create table if not exists accounts (
	account_id serial primary key,
    name text,
    password text
  )
`;
	if (createAccountsTableResult.count) {
		console.log('[db] createAccountsTableResult', createAccountsTableResult);
	}

	const createCommunitiesTableResult = await sql`
	create table if not exists communities (
		community_id serial primary key,
		name text
	)	
`;

	if (createCommunitiesTableResult.count) {
		console.log('[db] createCommunitiesTableResult', createCommunitiesTableResult);
	}

	const createAccountCommunities = await sql`
	create table if not exists account_communities (
		account_id int references accounts (account_id) ON UPDATE CASCADE ON DELETE CASCADE,
		community_id int references communities (community_id) ON UPDATE CASCADE,
		CONSTRAINT account_community_pkey PRIMARY KEY (account_id,community_id)
	)	
`;

	if (createCommunitiesTableResult.count) {
		console.log('[db] createAccountCommunitiesTableResult', createAccountCommunities);
	}

	// example: select
	interface AccountDoc {
		account_id?: number;
		name: string;
		password: string;
	}
	const accountDocs: AccountDoc[] = await sql`
  select account_id, name, password from accounts
`;
	console.log('[db] accountDocs', accountDocs);

	interface CommunityDoc {
		community_id?: number;
		name: string;
	}
	const communityDocs: CommunityDoc[] = await sql`
	select community_id, name from communities
	`;
	console.log('[db] communityDocs', communityDocs);

	interface AccountCommunityDoc {
		account_id: number;
		community_id: number;
	}
	const accountCommunityDocs: AccountCommunityDoc[] = await sql`
	select account_id,community_id from account_communities
	`;
	console.log('[db] accountCommunityDocs', accountCommunityDocs);

	// example: insert literal values
	const account1Doc = accountDocs.find((d) => d.name === 'account1');
	if (!account1Doc) {
		const account1InitialData = {name: 'ryan', password: 'HASHVALUE1'};
		const createAccount1Result = await sql`
    insert into accounts (
      name, password
    ) values (
      ${account1InitialData.name}, ${account1InitialData.password}
    )
  `;
		console.log('[db] createAccount1Result', createAccount1Result);
	}

	// example: insert with dynamic query helper
	const account2Doc = accountDocs.find((d) => d.name === 'account2');
	if (!account2Doc) {
		const account2: AccountDoc = {name: 'hamilton', password: 'HASHVALUE2'};
		const account2Result = await sql`
    insert into accounts ${sql(account2, 'name', 'password')}
  `;
		console.log('[db] createAccount2Result', account2Result);
	}

	const community1Doc = communityDocs.find((d) => d.community_id === 1);
	if (!community1Doc) {
		const community1InitialData = {name: 'felt'};
		const createCommunity1Result = await sql`
		insert into communities (
			name
		) values (
			${community1InitialData.name}
		)
		`;
		console.log('[db] createCommunity1Result', createCommunity1Result);
	}

	const community2Doc = communityDocs.find((d) => d.community_id === 2);
	if (!community2Doc) {
		const community2: CommunityDoc = {name: 'svelte'};
		const community2Result = await sql`
		insert into communities ${sql(community2, 'name')}
		`;
		console.log('[db] createCommunity2Result', community2Result);
	}

	const community3Doc = communityDocs.find((d) => d.community_id === 3);
	if (!community3Doc) {
		const community3: CommunityDoc = {name: 'backpackers-anonymous'};
		const community3Result = await sql`
		insert into communities ${sql(community3, 'name')}
		`;
		console.log('[db] createCommunity3Result', community3Result);
	}

	const accountCommunity1Doc = accountCommunityDocs.find(
		(d) => d.account_id === 1 && d.community_id === 1,
	);
	if (!accountCommunity1Doc) {
		const accountCommunity1: AccountCommunityDoc = {account_id: 1, community_id: 1};
		const accountcommunity1Result = await sql`
		insert into account_communities ${sql(accountCommunity1, 'account_id', 'community_id')}
		`;
		console.log('[db] createAccountCommunity1Result', accountcommunity1Result);
	}

	const accountCommunity2Doc = accountCommunityDocs.find(
		(d) => d.account_id === 1 && d.community_id === 2,
	);
	if (!accountCommunity2Doc) {
		const accountCommunity2: AccountCommunityDoc = {account_id: 1, community_id: 2};
		const accountcommunity2Result = await sql`
		insert into account_communities ${sql(accountCommunity2, 'account_id', 'community_id')}
		`;
		console.log('[db] createAccountCommunity2Result', accountcommunity2Result);
	}

	const accountCommunity3Doc = accountCommunityDocs.find(
		(d) => d.account_id === 2 && d.community_id === 1,
	);
	if (!accountCommunity3Doc) {
		const accountCommunity3: AccountCommunityDoc = {account_id: 2, community_id: 1};
		const accountcommunity3Result = await sql`
		insert into account_communities ${sql(accountCommunity3, 'account_id', 'community_id')}
		`;
		console.log('[db] createAccountCommunity3Result', accountcommunity3Result);
	}

	const accountCommunity4Doc = accountCommunityDocs.find(
		(d) => d.account_id === 2 && d.community_id === 3,
	);
	if (!accountCommunity4Doc) {
		const accountCommunity4: AccountCommunityDoc = {account_id: 2, community_id: 3};
		const accountcommunity4Result = await sql`
		insert into account_communities ${sql(accountCommunity4, 'account_id', 'community_id')}
		`;
		console.log('[db] createAccountCommunity4Result', accountcommunity4Result);
	}

	// example: select after inserting
	// don't double print:
	if (!accountDocs.length) {
		const accountDocs: AccountDoc[] = await sql`
    select name, password from accounts
  `;
		console.log('[db] accountDocs', accountDocs);
	}
};
