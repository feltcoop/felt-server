import type {Database} from '$lib/db/Database.js';
import type {Account} from '$lib/vocab/account/account.js';
import type {Space} from '$lib/spaces/space.js';
import type {Post} from '$lib/posts/post.js';

export const seed = async (db: Database): Promise<void> => {
	const {sql} = db;

	console.log('[seed] adding initial dataset to database');

	// example: create table
	const create_accounts_table_result = await sql`
		create table if not exists accounts (
		account_id serial primary key,
			name text,
			password text
		)
	`;
	if (create_accounts_table_result.count) {
		console.log('[db] create_accounts_table_result', create_accounts_table_result);
	}

	const create_communities_table_result = await sql`
		create table if not exists communities (
			community_id serial primary key,
			name text
		)	
	`;

	if (create_communities_table_result.count) {
		console.log('[db] create_communities_table_result', create_communities_table_result);
	}

	const create_account_communities_result = await sql`
		create table if not exists account_communities (
			account_id int references accounts (account_id) ON UPDATE CASCADE ON DELETE CASCADE,
			community_id int references communities (community_id) ON UPDATE CASCADE,
			CONSTRAINT account_community_pkey PRIMARY KEY (account_id,community_id)
		)	
	`;

	if (create_account_communities_result.count) {
		console.log('[db] create_account_communities_result', create_account_communities_result);
	}

	const create_spaces_table_result = await sql`
		create table if not exists spaces (
			space_id serial primary key,
			url text,
			media_type text,
			content text
		)	
	`;

	if (create_spaces_table_result.count) {
		console.log('[db] create_spaces_table_result', create_spaces_table_result);
	}

	const create_community_spaces_table_result = await sql`
		create table if not exists community_spaces (
			community_id int references communities (community_id) ON UPDATE CASCADE ON DELETE CASCADE,
			space_id int references spaces (space_id) ON UPDATE CASCADE,
			CONSTRAINT community_spaces_pkey PRIMARY KEY (community_id,space_id)
		)	
	`;

	if (create_community_spaces_table_result.count) {
		console.log('[db] create_community_spaces_table_result', create_community_spaces_table_result);
	}

	const create_posts_table_result = await sql`
		create table if not exists posts (
			post_id serial primary key,
			content text,
			actor_id int,
			space_id int references spaces (space_id) ON UPDATE CASCADE ON DELETE CASCADE
		)	
	`;

	if (create_posts_table_result.count) {
		console.log('[db] create_posts_table_result', create_posts_table_result);
	}

	const space_docs: Space[] = await sql`
		select space_id, url, media_type, content from spaces
	`;
	console.log('[db] space_docs', space_docs);

	const account_docs: Account[] = await sql`
		select account_id, name, password from accounts
	`;
	console.log('[db] account_docs', account_docs);

	const post_docs: Post[] = await sql`
		select post_id, content, actor_id, space_id from posts
	`;
	console.log('[db] post_docs', post_docs);

	interface Community_Doc {
		community_id?: number;
		name: string;
	}
	const community_docs: Community_Doc[] = await sql`
		select community_id, name from communities
	`;
	console.log('[db] community_docs', community_docs);

	interface Account_Community_Doc {
		account_id: number;
		community_id: number;
	}
	const account_community_docs: Account_Community_Doc[] = await sql`
		select account_id,community_id from account_communities
	`;
	console.log('[db] account_community_docs', account_community_docs);

	interface Community_Spaces_Doc {
		community_id: number;
		space_id: number;
	}
	const community_spaces_docs: Community_Spaces_Doc[] = await sql`
	select space_id,community_id from community_spaces
	`;
	console.log('[db] community_spaces_docs', community_spaces_docs);

	// example: insert literal values
	const account1_doc = account_docs.find((d) => d.name === 'account1');
	if (!account1_doc) {
		const account1_initial_data = {
			name: 'a',
			password: 'ded6a3304309fe718831c3968bdda1b36fb0acae7de54a4cb011ba10923aab71', // 'a' hashed
		};
		const create_account1_result = await sql`
			insert into accounts (
				name, password
			) values (
				${account1_initial_data.name}, ${account1_initial_data.password}
			)
		`;
		console.log('[db] create_account1_result', create_account1_result);
	}

	// example: insert with dynamic query helper
	const account2_doc = account_docs.find((d) => d.name === 'account2');
	if (!account2_doc) {
		const account2: Account = {
			name: 'b',
			password: 'bff5c2262849491dd4047eb7086a7948428885aef62e3b90aa388c9db11d1c1e', // 'b' hashed
		};
		const account2_result = await sql`
			insert into accounts ${sql(account2, 'name', 'password')}
		`;
		console.log('[db] create_account2_result', account2_result);
	}

	const community1_doc = community_docs.find((d) => d.community_id === 1);
	if (!community1_doc) {
		const community1_initial_data = {name: 'felt'};
		const create_community1_result = await sql`
			insert into communities (
				name
			) values (
				${community1_initial_data.name}
			)
		`;
		console.log('[db] create_community1_result', create_community1_result);
	}

	const community2_doc = community_docs.find((d) => d.community_id === 2);
	if (!community2_doc) {
		const community2: Community_Doc = {name: 'svelte'};
		const community2_result = await sql`
			insert into communities ${sql(community2, 'name')}
		`;
		console.log('[db] create_community2_result', community2_result);
	}

	const community3_doc = community_docs.find((d) => d.community_id === 3);
	if (!community3_doc) {
		const community3: Community_Doc = {name: 'backpackers-anonymous'};
		const community3_result = await sql`
			insert into communities ${sql(community3, 'name')}
		`;
		console.log('[db] create_community3_result', community3_result);
	}

	const account_community1_doc = account_community_docs.find(
		(d) => d.account_id === 1 && d.community_id === 1,
	);
	if (!account_community1_doc) {
		const account_community1: Account_Community_Doc = {account_id: 1, community_id: 1};
		const account_community1_result = await sql`
			insert into account_communities ${sql(account_community1, 'account_id', 'community_id')}
		`;
		console.log('[db] create_account_community1_result', account_community1_result);
	}

	const account_community2_doc = account_community_docs.find(
		(d) => d.account_id === 1 && d.community_id === 2,
	);
	if (!account_community2_doc) {
		const account_community2: Account_Community_Doc = {account_id: 1, community_id: 2};
		const account_community2_result = await sql`
			insert into account_communities ${sql(account_community2, 'account_id', 'community_id')}
		`;
		console.log('[db] create_account_community2_result', account_community2_result);
	}

	const account_community3_doc = account_community_docs.find(
		(d) => d.account_id === 2 && d.community_id === 1,
	);
	if (!account_community3_doc) {
		const account_community3: Account_Community_Doc = {account_id: 2, community_id: 1};
		const account_community3_result = await sql`
			insert into account_communities ${sql(account_community3, 'account_id', 'community_id')}
		`;
		console.log('[db] create_account_community3_result', account_community3_result);
	}

	const account_community4_doc = account_community_docs.find(
		(d) => d.account_id === 2 && d.community_id === 3,
	);
	if (!account_community4_doc) {
		const account_community4: Account_Community_Doc = {account_id: 2, community_id: 3};
		const account_community4_result = await sql`
			insert into account_communities ${sql(account_community4, 'account_id', 'community_id')}
		`;
		console.log('[db] create_account_community4_result', account_community4_result);
	}

	const space1 = space_docs.find((d) => d.space_id === 1);
	if (!space1) {
		const space1: Space = {
			url: '/general',
			media_type: 'application/json',
			content: '{"type": "ChatRoom", "props": {"data": "/general/posts"}}',
		};
		const space1_result = await sql`
			insert into spaces ${sql(space1, 'url', 'media_type', 'content')}
		`;
		console.log('[db] create_space1_result', space1_result);
	}

	const space2 = space_docs.find((d) => d.space_id === 2);
	if (!space2) {
		const space2: Space = {
			url: '/general/cute',
			media_type: 'application/json',
			content: '{"type": "ChatRoom", "props": {"data": "/general/cute/posts"}}',
		};
		const space2_result = await sql`
			insert into spaces ${sql(space2, 'url', 'media_type', 'content')}
		`;
		console.log('[db] create_space2_result', space2_result);
	}

	const space3 = space_docs.find((d) => d.space_id === 3);
	if (!space3) {
		const space3: Space = {
			url: '/dm/a',
			media_type: 'application/json',
			content: '{"type": "DirectMessage", "props": {"data": "/dm/a/posts"}}',
		};
		const space3_result = await sql`
			insert into spaces ${sql(space3, 'url', 'media_type', 'content')}
		`;
		console.log('[db] create_space3_result', space3_result);
	}

	const community_spaces1_doc = community_spaces_docs.find(
		(d) => d.space_id === 1 && d.community_id === 1,
	);
	if (!community_spaces1_doc) {
		const community_spaces1: Community_Spaces_Doc = {space_id: 1, community_id: 1};
		const community_spaces1_result = await sql`
			insert into community_spaces ${sql(community_spaces1, 'space_id', 'community_id')}
		`;
		console.log('[db] community_spaces1_result', community_spaces1_result);
	}

	const community_spaces2_doc = community_spaces_docs.find(
		(d) => d.space_id === 2 && d.community_id === 1,
	);
	if (!community_spaces2_doc) {
		const community_spaces2: Community_Spaces_Doc = {space_id: 2, community_id: 1};
		const community_spaces2_result = await sql`
			insert into community_spaces ${sql(community_spaces2, 'space_id', 'community_id')}
		`;
		console.log('[db] community_spaces2_result', community_spaces2_result);
	}

	const community_spaces3_doc = community_spaces_docs.find(
		(d) => d.space_id === 3 && d.community_id === 1,
	);
	if (!community_spaces3_doc) {
		const community_spaces3: Community_Spaces_Doc = {space_id: 3, community_id: 1};
		const community_spaces3_result = await sql`
			insert into community_spaces ${sql(community_spaces3, 'space_id', 'community_id')}
		`;
		console.log('[db] community_spaces3_result', community_spaces3_result);
	}

	const post1 = post_docs.find((d) => d.post_id === 1);
	if (!post1) {
		const post1: Post = {
			content: 'Those who know do not speak.',
			actor_id: 1,
			space_id: 1,
		};
		const post1_result = await sql`
			insert into posts ${sql(post1, 'content', 'actor_id', 'space_id')}
		`;
		console.log('[db] create_post1_result', post1_result);
	}

	const post2 = post_docs.find((d) => d.post_id === 2);
	if (!post2) {
		const post2: Post = {
			content: 'Those who speak do not know.',
			actor_id: 2,
			space_id: 1,
		};
		const post2_result = await sql`
			insert into posts ${sql(post2, 'content', 'actor_id', 'space_id')}
		`;
		console.log('[db] create_post2_result', post2_result);
	}

	const post3 = post_docs.find((d) => d.post_id === 3);
	if (!post3) {
		const post3: Post = {
			content: "All the world's a stage.",
			actor_id: 2,
			space_id: 2,
		};
		const post3_result = await sql`
			insert into posts ${sql(post3, 'content', 'actor_id', 'space_id')}
		`;
		console.log('[db] create_post3_result', post3_result);
	}

	const post4 = post_docs.find((d) => d.post_id === 4);
	if (!post4) {
		const post4: Post = {
			content: 'And all the men and women merely players.',
			actor_id: 1,
			space_id: 2,
		};
		const post4_result = await sql`
			insert into posts ${sql(post4, 'content', 'actor_id', 'space_id')}
		`;
		console.log('[db] create_post4_result', post4_result);
	}

	const post5 = post_docs.find((d) => d.post_id === 5);
	if (!post5) {
		const post5: Post = {
			content: 'If the evidence says you’re wrong, you don’t have the right theory.',
			actor_id: 1,
			space_id: 3,
		};
		const post5_result = await sql`
			insert into posts ${sql(post5, 'content', 'actor_id', 'space_id')}
		`;
		console.log('[db] create_post5_result', post5_result);
	}

	const post6 = post_docs.find((d) => d.post_id === 6);
	if (!post6) {
		const post6: Post = {
			content: 'You change the theory, not the evidence.',
			actor_id: 2,
			space_id: 3,
		};
		const post6_result = await sql`
			insert into posts ${sql(post6, 'content', 'actor_id', 'space_id')}
		`;
		console.log('[db] create_post6_result', post6_result);
	}

	// example: select after inserting
	// don't double print:
	if (!account_docs.length) {
		const accounts: Account[] = await sql`
			select name, password from accounts
		`;
		console.log('[db] accounts', accounts);
	}
};
