import type {Database} from '$lib/db/Database.js';
import type {Account, AccountParams} from '$lib/vocab/account/account.js';
import type {Space, SpaceParams} from '$lib/vocab/space/space.js';
import type {Post} from '$lib/vocab/post/post.js';
import type {
	PersonaCommunity,
	PersonaCommunityParams,
	CommunitySpaces,
} from '$lib/vocab/community/community';

// TODO extract seed helpers and db methods

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

	const create_personas_table_result = await sql`
		create table if not exists personas (
			persona_id serial primary key,
			account_id int,
			name text
		)
	`;

	if (create_personas_table_result.count) {
		console.log('[db] create_personas_table_result', create_personas_table_result);
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

	const create_persona_communities_result = await sql`
		create table if not exists persona_communities (
			persona_id int references personas (persona_id) ON UPDATE CASCADE ON DELETE CASCADE,
			community_id int references communities (community_id) ON UPDATE CASCADE,
			CONSTRAINT persona_community_pkey PRIMARY KEY (persona_id,community_id)
		)	
	`;

	if (create_persona_communities_result.count) {
		console.log('[db] create_persona_communities_result', create_persona_communities_result);
	}

	const create_spaces_table_result = await sql`
		create table if not exists spaces (
			space_id serial primary key,
			name text,
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

	const space_docs = await sql<Space[]>`
		select space_id, url, media_type, content from spaces
	`;
	console.log('[db] space_docs', space_docs);

	const account_docs = await sql<Account[]>`
		select account_id, name, password from accounts
	`;
	console.log('[db] account_docs', account_docs);

	const post_docs = await sql<Post[]>`
		select post_id, content, actor_id, space_id from posts
	`;
	console.log('[db] post_docs', post_docs);

	interface CommunityDoc {
		community_id?: number;
		name: string;
	}
	const community_docs = await sql<CommunityDoc[]>`
		select community_id, name from communities
	`;
	console.log('[db] community_docs', community_docs);

	const persona_community_docs = await sql<PersonaCommunity[]>`
		select persona_id,community_id from persona_communities
	`;
	console.log('[db] persona_community_docs', persona_community_docs);

	const community_spaces_docs = await sql<CommunitySpaces[]>`
		select space_id,community_id from community_spaces
	`;
	console.log('[db] community_spaces_docs', community_spaces_docs);

	// example: insert literal values
	const account1_doc = account_docs.find((d) => d.name === 'account1');
	if (!account1_doc) {
		const account1: AccountParams = {
			name: 'a',
			password: 'ded6a3304309fe718831c3968bdda1b36fb0acae7de54a4cb011ba10923aab71', // 'a' hashed
		};
		const create_account1_result = await sql`
			insert into accounts (
				name, password
			) values (
				${account1.name}, ${account1.password}
			)
		`;
		console.log('[db] create_account1_result', create_account1_result);

		const create_persona1_result = await sql`
				insert into personas (
					account_id, name
				) values (
					1, 'andy'
				)
		`;

		console.log('[db] create_persona1_result', create_persona1_result);

		const create_persona2_result = await sql`
				insert into personas (
					account_id, name
				) values (
					1, 'alice'
				)
		`;

		console.log('[db] create_persona2_result', create_persona2_result);
	}

	// example: insert with dynamic query helper
	const account2_doc = account_docs.find((d) => d.name === 'account2');
	if (!account2_doc) {
		const account2: AccountParams = {
			name: 'b',
			password: 'bff5c2262849491dd4047eb7086a7948428885aef62e3b90aa388c9db11d1c1e', // 'b' hashed
		};
		const account2_result = await sql`
			insert into accounts ${sql(account2, 'name', 'password')}
		`;
		console.log('[db] create_account2_result', account2_result);

		const create_persona3_result = await sql`
				insert into personas (
					account_id, name
				) values (
					2, 'bob'
				)
		`;

		console.log('[db] create_persona3_result', create_persona3_result);

		const create_persona4_result = await sql`
				insert into personas (
					account_id, name
				) values (
					2, 'betty'
				)
		`;

		console.log('[db] create_persona4_result', create_persona4_result);
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
		const community2: CommunityDoc = {name: 'dev'};
		const community2_result = await sql`
			insert into communities ${sql(community2, 'name')}
		`;
		console.log('[db] create_community2_result', community2_result);
	}

	const community3_doc = community_docs.find((d) => d.community_id === 3);
	if (!community3_doc) {
		const community3: CommunityDoc = {name: 'backpackers-anonymous'};
		const community3_result = await sql`
			insert into communities ${sql(community3, 'name')}
		`;
		console.log('[db] create_community3_result', community3_result);
	}

	const persona_community1_doc = persona_community_docs.find(
		(d) => d.persona_id === 1 && d.community_id === 1,
	);
	if (!persona_community1_doc) {
		const persona_community1: PersonaCommunityParams = {persona_id: 1, community_id: 1};
		const persona_community1_result = await sql`
			insert into persona_communities ${sql(persona_community1, 'persona_id', 'community_id')}
		`;
		console.log('[db] create_persona_community1_result', persona_community1_result);
	}

	const persona_community2_doc = persona_community_docs.find(
		(d) => d.persona_id === 1 && d.community_id === 2,
	);
	if (!persona_community2_doc) {
		const persona_community2: PersonaCommunityParams = {persona_id: 2, community_id: 2};
		const persona_community2_result = await sql`
			insert into persona_communities ${sql(persona_community2, 'persona_id', 'community_id')}
		`;
		console.log('[db] create_persona_community2_result', persona_community2_result);
	}

	const persona_community3_doc = persona_community_docs.find(
		(d) => d.persona_id === 2 && d.community_id === 1,
	);
	if (!persona_community3_doc) {
		const persona_community3: PersonaCommunityParams = {persona_id: 3, community_id: 1};
		const persona_community3_result = await sql`
			insert into persona_communities ${sql(persona_community3, 'persona_id', 'community_id')}
		`;
		console.log('[db] create_persona_community3_result', persona_community3_result);
	}

	const persona_community4_doc = persona_community_docs.find(
		(d) => d.persona_id === 2 && d.community_id === 3,
	);
	if (!persona_community4_doc) {
		const persona_community4: PersonaCommunityParams = {persona_id: 4, community_id: 3};
		const persona_community4_result = await sql`
			insert into persona_communities ${sql(persona_community4, 'persona_id', 'community_id')}
		`;
		console.log('[db] create_persona_community4_result', persona_community4_result);
	}

	const create_space = async (
		space_id: number,
		community_id: number,
		params: SpaceParams,
	): Promise<void> => {
		if (!space_docs.find((d) => d.space_id === space_id)) {
			await db.repos.spaces.insert(community_id, params);
		}
	};

	await create_space(1, 1, {
		name: 'chat',
		url: '/chat',
		media_type: 'application/fuz+json',
		content: '{"type": "Chat", "props": {"data": "/chat/posts"}}',
	});
	await create_space(2, 1, {
		name: 'board',
		url: '/board',
		media_type: 'application/fuz+json',
		content: '{"type": "Board", "props": {"data": "/board/posts"}}',
	});
	await create_space(3, 1, {
		name: 'forum',
		url: '/forum',
		media_type: 'application/fuz+json',
		content: '{"type": "Forum", "props": {"data": "/forum/posts"}}',
	});
	await create_space(4, 1, {
		name: 'dm/a',
		url: '/dm/a',
		media_type: 'application/fuz+json',
		content: '{"type": "Chat", "props": {"data": "/dm/a/posts"}}',
	});
	await create_space(5, 1, {
		name: 'notes',
		url: '/notes',
		media_type: 'application/fuz+json',
		content: '{"type": "Notes", "props": {"data": "/notes"}}',
	});
	await create_space(6, 1, {
		name: 'felt library',
		url: '/library',
		media_type: 'application/fuz+json',
		content: '{"type": "Iframe", "props": {"url": "https://www.felt.dev/sketch/library"}}',
	});
	await create_space(7, 1, {
		name: 'dealt: tar',
		url: '/tar',
		media_type: 'application/fuz+json',
		content: '{"type": "Iframe", "props": {"url": "https://www.dealt.dev/tar"}}',
	});

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
			actor_id: 3,
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
			actor_id: 3,
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
			actor_id: 3,
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
