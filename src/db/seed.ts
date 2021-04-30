import type {Database} from 'src/db/Database.js';
import type {Account} from 'src/vocab/account/account.js';
import type {Space} from 'src/spaces/space.js';

export const seed = async (db: Database): Promise<void> => {
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

	if (createAccountCommunities.count) {
		console.log('[db] createAccountCommunitiesTableResult', createAccountCommunities);
	}

	const createSpacesTableResult = await sql`
	create table if not exists spaces (
		space_id serial primary key,
		url text,
		media_type text,
		content text
	)	
`;

	if (createSpacesTableResult.count) {
		console.log('[db] createSpacesTableResult', createSpacesTableResult);
	}

	const createCommunitySpaces = await sql`
	create table if not exists community_spaces (
		community_id int references communities (community_id) ON UPDATE CASCADE ON DELETE CASCADE,
		space_id int references spaces (space_id) ON UPDATE CASCADE,
		CONSTRAINT community_spaces_pkey PRIMARY KEY (community_id,space_id)
	)	
`;

	if (createCommunitySpaces.count) {
		console.log('[db] createCommunitySpacesTableResult', createAccountCommunities);
	}

	const spaceDocs: Space[] = await sql`
  select space_id, url, media_type, content from spaces
`;
	console.log('[db] spaceDocs', spaceDocs);

	const accountDocs: Account[] = await sql`
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

	interface CommunitySpacesDoc {
		community_id: number;
		space_id: number;
	}
	const communitySpacesDocs: CommunitySpacesDoc[] = await sql`
	select space_id,community_id from community_spaces
	`;
	console.log('[db] communitySpacesDocs', communitySpacesDocs);

	// example: insert literal values
	const account1Doc = accountDocs.find((d) => d.name === 'account1');
	if (!account1Doc) {
		const account1InitialData = {
			name: 'a',
			password: 'ded6a3304309fe718831c3968bdda1b36fb0acae7de54a4cb011ba10923aab71', // 'a' hashed
		};
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
		const account2: Account = {
			name: 'b',
			password: 'bff5c2262849491dd4047eb7086a7948428885aef62e3b90aa388c9db11d1c1e', // 'b' hashed
		};
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

	const space1 = spaceDocs.find((d) => d.space_id === 1);
	if (!space1) {
		const space1: Space = {
			url: '/general',
			media_type: 'application/json',
			content: "{type: 'ChatRoom', props: {data: '/general/posts'}}",
		};
		const space1Result = await sql`
		insert into spaces ${sql(space1, 'url', 'media_type', 'content')}
		`;
		console.log('[db] createSpace1Result', space1Result);
	}

	const space2 = spaceDocs.find((d) => d.space_id === 2);
	if (!space2) {
		const space2: Space = {
			url: '/general/cute',
			media_type: 'application/json',
			content: "{type: 'ChatRoom', props: {data: '/general/fluffy/posts'}}",
		};
		const space2Result = await sql`
		insert into spaces ${sql(space2, 'url', 'media_type', 'content')}
		`;
		console.log('[db] createSpace2Result', space2Result);
	}

	const space3 = spaceDocs.find((d) => d.space_id === 3);
	if (!space3) {
		const space3: Space = {
			url: '/dm/a',
			media_type: 'application/json',
			content: "{type: 'DirectMessage', props: {data: '/dm/a/posts'}}",
		};
		const space3Result = await sql`
		insert into spaces ${sql(space3, 'url', 'media_type', 'content')}
		`;
		console.log('[db] createSpace3Result', space3Result);
	}

	const communitySpaces1Doc = communitySpacesDocs.find(
		(d) => d.space_id === 1 && d.community_id === 1,
	);
	if (!communitySpaces1Doc) {
		const communitySpaces1: CommunitySpacesDoc = {space_id: 1, community_id: 1};
		const communitySpaces1Result = await sql`
		insert into community_spaces ${sql(communitySpaces1, 'space_id', 'community_id')}
		`;
		console.log('[db] communitySpaces1Result', communitySpaces1Result);
	}

	const communitySpaces2Doc = communitySpacesDocs.find(
		(d) => d.space_id === 2 && d.community_id === 1,
	);
	if (!communitySpaces2Doc) {
		const communitySpaces2: CommunitySpacesDoc = {space_id: 2, community_id: 1};
		const communitySpaces2Result = await sql`
		insert into community_spaces ${sql(communitySpaces2, 'space_id', 'community_id')}
		`;
		console.log('[db] communitySpaces2Result', communitySpaces2Result);
	}

	const communitySpaces3Doc = communitySpacesDocs.find(
		(d) => d.space_id === 3 && d.community_id === 1,
	);
	if (!communitySpaces3Doc) {
		const communitySpaces3: CommunitySpacesDoc = {space_id: 3, community_id: 1};
		const communitySpaces3Result = await sql`
		insert into community_spaces ${sql(communitySpaces3, 'space_id', 'community_id')}
		`;
		console.log('[db] communitySpaces3Result', communitySpaces3Result);
	}

	// example: select after inserting
	// don't double print:
	if (!accountDocs.length) {
		const accounts: Account[] = await sql`
    select name, password from accounts
  `;
		console.log('[db] accounts', accounts);
	}
};
