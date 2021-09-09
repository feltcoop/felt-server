import {unwrap} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {cyan} from '@feltcoop/felt/util/terminal.js';

import type {Database} from '$lib/db/Database.js';
import type {Account, AccountParams} from '$lib/vocab/account/account.js';
import type {Space} from '$lib/vocab/space/space.js';
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

	const create_files_table_result = await sql`
		create table if not exists files (
			file_id serial primary key,
			content text,
			actor_id int,
			space_id int references spaces (space_id) ON UPDATE CASCADE ON DELETE CASCADE
		)	
	`;

	if (create_files_table_result.count) {
		log.trace('create_files_table_result', create_files_table_result);
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
			const spaces = unwrap(
				await db.repos.space.create_default_spaces(community.community_id),
			) as Space[]; // TODO why cast?
			await create_default_files(db, spaces, [persona]);
		}
	}

	const communitiesParams: CommunityParams[] = [
		{name: 'felt'},
		{name: 'dev'},
		{name: 'backpackers-anonymous'},
	];
	const communities: Community[] = [];

	const mainPersonaCreator = personas[0];
	const otherPersonas = personas.slice(1);

	for (const communityParams of communitiesParams) {
		const community = unwrap(
			await db.repos.community.create(communityParams.name, mainPersonaCreator.persona_id),
		) as Community; // TODO why cast?
		communities.push(community);
		for (const persona of otherPersonas) {
			await db.repos.member.create(persona.persona_id, community.community_id);
		}
		await create_default_files(db, community.spaces, personas);
	}
};

const create_default_files = async (db: Database, spaces: Space[], personas: Persona[]) => {
	const filesContents: {[key: string]: string[]} = {
		Chat: ['Those who know do not speak.', 'Those who speak do not know.'],
		Board: ["All the world's a stage.", 'And all the men and women merely players.'],
		Forum: [
			'If the evidence says you’re wrong, you don’t have the right theory.',
			'You change the theory, not the evidence.',
		],
		Notes: ['go to the place later', 'remember the thing', 'what a day!'],
	};

	let persona_index = -1;
	const nextPersona = (): Persona => {
		persona_index++;
		if (persona_index === personas.length) persona_index = 0;
		return personas[persona_index];
	};

	for (const space of spaces) {
		const spaceContent = JSON.parse(space.content);
		if (!(spaceContent.type in filesContents)) {
			continue;
		}
		const fileContents = filesContents[spaceContent.type];
		for (const fileContent of fileContents) {
			await db.repos.file.create(nextPersona().persona_id, space.space_id, fileContent);
		}
	}
};
