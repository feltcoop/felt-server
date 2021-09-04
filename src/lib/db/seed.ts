import {unwrap} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {cyan} from '@feltcoop/felt/util/terminal.js';

import type {Database} from '$lib/db/Database.js';
import type {Account, AccountParams} from '$lib/vocab/account/account.js';
import type {Post} from '$lib/vocab/post/post.js';
import type {Community, CommunityParams} from '$lib/vocab/community/community';
import type {Persona} from '$lib/vocab/persona/persona';

// TODO extract seed helpers and db methods

const log = new Logger([cyan('[seed]')]);

export const seed = async (db: Database): Promise<void> => {
	const {sql} = db;

	log.trace('adding initial dataset to database');

	// example: create table
	const create_accounts_table_result = await sql`
		create table if not exists accounts (
		account_id serial primary key,
			name text,
			password text
		)
	`;
	if (create_accounts_table_result.count) {
		log.trace('create_accounts_table_result', create_accounts_table_result);
	}

	const create_personas_table_result = await sql`
		create table if not exists personas (
			persona_id serial primary key,
			account_id int,
			name text
		)
	`;

	if (create_personas_table_result.count) {
		log.trace('create_personas_table_result', create_personas_table_result);
	}

	const create_communities_table_result = await sql`
		create table if not exists communities (
			community_id serial primary key,
			name text
		)	
	`;

	if (create_communities_table_result.count) {
		log.trace('create_communities_table_result', create_communities_table_result);
	}

	const create_persona_communities_result = await sql`
		create table if not exists persona_communities (
			persona_id int references personas (persona_id) ON UPDATE CASCADE ON DELETE CASCADE,
			community_id int references communities (community_id) ON UPDATE CASCADE,
			CONSTRAINT persona_community_pkey PRIMARY KEY (persona_id,community_id)
		)	
	`;

	if (create_persona_communities_result.count) {
		log.trace('create_persona_communities_result', create_persona_communities_result);
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
		log.trace('create_spaces_table_result', create_spaces_table_result);
	}

	const create_community_spaces_table_result = await sql`
		create table if not exists community_spaces (
			community_id int references communities (community_id) ON UPDATE CASCADE ON DELETE CASCADE,
			space_id int references spaces (space_id) ON UPDATE CASCADE,
			CONSTRAINT community_spaces_pkey PRIMARY KEY (community_id,space_id)
		)	
	`;

	if (create_community_spaces_table_result.count) {
		log.trace('create_community_spaces_table_result', create_community_spaces_table_result);
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
		log.trace('create_posts_table_result', create_posts_table_result);
	}

	const account_docs = await sql<Account[]>`
		select account_id, name, password from accounts
	`;
	if (account_docs.length) {
		return; // already seeded
	}

	// example: insert literal values
	const accountsParams: AccountParams[] = [
		{name: 'a', password: 'a'},
		{name: 'b', password: 'b'},
	];
	const personasParams: {[key: string]: string[]} = {
		a: ['alice', 'andy'],
		b: ['betty', 'billy'],
	};
	const personas: Persona[] = [];
	for (const accountParams of accountsParams) {
		const account = unwrap(await db.repos.account.create(accountParams)) as Account;
		log.trace('created account', account);
		for (const personaName of personasParams[account.name]) {
			const {persona, community} = unwrap(
				await db.repos.persona.create(personaName, account.account_id),
			) as {persona: Persona; community: Community}; // TODO why typecast?
			log.trace('created persona', persona);
			personas.push(persona);
			await db.repos.space.create_default_spaces(community.community_id);
		}
	}

	const communitiesParams: CommunityParams[] = [
		{name: 'felt'},
		{name: 'dev'},
		{name: 'backpackers-anonymous'},
	];
	const communities: Community[] = [];

	for (const communityParams of communitiesParams) {
		const community = unwrap(
			await db.repos.community.create(communityParams.name, personas[0].persona_id),
		) as Community; // TODO type?
		communities.push(community);
		await db.repos.space.create_default_spaces(community.community_id);
	}

	for (const community of communities) {
		for (const persona of personas.slice(1)) {
			await db.repos.member.create(persona.persona_id, community.community_id);
		}
	}

	const postsParams: Post[] = [
		{
			content: 'Those who know do not speak.',
			actor_id: 1,
			space_id: 1,
		},
		{
			content: 'Those who speak do not know.',
			actor_id: 2,
			space_id: 1,
		},
		{
			content: "All the world's a stage.",
			actor_id: 2,
			space_id: 2,
		},
		{
			content: 'And all the men and women merely players.',
			actor_id: 1,
			space_id: 2,
		},
		{
			content: 'If the evidence says you’re wrong, you don’t have the right theory.',
			actor_id: 1,
			space_id: 3,
		},
		{
			content: 'You change the theory, not the evidence.',
			actor_id: 2,
			space_id: 3,
		},
	];

	for (const postParams of postsParams) {
		await db.repos.post.create(postParams.actor_id, postParams.space_id, postParams.content);
	}
};
