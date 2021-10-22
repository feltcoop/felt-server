import {unwrap} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {cyan} from '@feltcoop/felt/util/terminal.js';

import type {Database} from '$lib/db/Database.js';
import type {Account, create_account_params_type} from '$lib/vocab/account/account.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {Community} from '$lib/vocab/community/community';
import type {create_community_params_type} from '$lib/ui/events';
import type {Persona} from '$lib/vocab/persona/persona';

// TODO extract seed helpers and db methods

const log = new Logger([cyan('[seed]')]);

export const seed = async (db: Database): Promise<void> => {
	const {sql} = db;

	log.trace('adding initial dataset to database');

	const accountDocs = await sql<Account[]>`
		select account_id, name, password from accounts
	`;
	if (accountDocs.length) {
		return; // already seeded
	}

	// example: insert literal values
	const accountsParams: create_account_params_type[] = [
		{name: 'a', password: 'a'},
		{name: 'b', password: 'b'},
	];
	const personasParams: {[key: string]: string[]} = {
		a: ['alice', 'andy'],
		b: ['betty', 'billy'],
	};
	const personas: Persona[] = [];
	for (const accountParams of accountsParams) {
		const account = unwrap(await db.repos.account.create(accountParams));
		log.trace('created account', account);
		for (const personaName of personasParams[account.name]) {
			const {persona, community} = unwrap(
				await db.repos.persona.create(personaName, account.account_id),
			);
			log.trace('created persona', persona);
			personas.push(persona);
			const spaces = unwrap(await db.repos.space.filterByCommunity(community.community_id));
			await createDefaultFiles(db, spaces, [persona]);
		}
	}

	const mainPersonaCreator = personas[0];
	const otherPersonas = personas.slice(1);

	const communitiesParams: create_community_params_type[] = [
		{name: 'felt', persona_id: mainPersonaCreator.persona_id},
		{name: 'dev', persona_id: mainPersonaCreator.persona_id},
		{name: 'backpackers-anonymous', persona_id: mainPersonaCreator.persona_id},
	];
	const communities: Community[] = [];

	for (const communityParams of communitiesParams) {
		const community = unwrap(
			await db.repos.community.create({
				name: communityParams.name,
				persona_id: communityParams.persona_id,
			}),
		);
		communities.push(community);
		for (const persona of otherPersonas) {
			await db.repos.membership.create({
				persona_id: persona.persona_id,
				community_id: community.community_id,
			});
		}
		await createDefaultFiles(db, community.spaces, personas);
	}
};

const createDefaultFiles = async (db: Database, spaces: Space[], personas: Persona[]) => {
	const filesContents: {[key: string]: string[]} = {
		Room: ['Those who know do not speak.', 'Those who speak do not know.'],
		Board: ["All the world's a stage.", 'And all the men and women merely players.'],
		Forum: [
			'If the evidence says you’re wrong, you don’t have the right theory.',
			'You change the theory, not the evidence.',
		],
		Notes: [
			'We have no guarantee about the future',
			'but we exist in the hope of something better.',
			'The 14th Dalai Lama',
		],
	};

	let personaIndex = -1;
	const nextPersona = (): Persona => {
		personaIndex++;
		if (personaIndex === personas.length) personaIndex = 0;
		return personas[personaIndex];
	};

	for (const space of spaces) {
		const spaceContent = JSON.parse(space.content);
		if (!(spaceContent.type in filesContents)) {
			continue;
		}
		const fileContents = filesContents[spaceContent.type];
		for (const fileContent of fileContents) {
			await db.repos.file.create({
				actor_id: nextPersona().persona_id,
				space_id: space.space_id,
				content: fileContent,
			});
		}
	}
};
