import {unwrap} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {cyan} from 'kleur/colors';
import {traverse} from '@feltcoop/felt/util/object.js';

import type {Database} from '$lib/db/Database.js';
import type {Account} from '$lib/vocab/account/account.js';
import type {CreateAccountParams} from '$lib/vocab/account/account.schema.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {Community} from '$lib/vocab/community/community';
import type {CreateCommunityParams} from '$lib/app/eventTypes';
import type {Persona} from '$lib/vocab/persona/persona';
import type {ViewData} from '$lib/vocab/view/view';
import {createAccountPersonaService} from '$lib/vocab/persona/personaServices';
import {createCommunityService} from '$lib/vocab/community/communityServices';
import {SessionApiMock} from '$lib/server/SessionApiMock';

/* eslint-disable no-await-in-loop */

// TODO extract seed helpers and db methods

const log = new Logger([cyan('[seed]')]);

const session = new SessionApiMock();

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
	const accountsParams: CreateAccountParams[] = [
		{name: 'a', password: 'a'},
		{name: 'b', password: 'b'},
	];
	const personasParams: {[key: string]: string[]} = {
		a: ['alice', 'andy'],
		b: ['betty', 'billy'],
	};
	const accounts: Account[] = [];
	const personas: Persona[] = [];
	for (const accountParams of accountsParams) {
		const account = unwrap(
			await db.repos.account.create(accountParams.name, accountParams.password),
		);
		log.trace('created account', account);
		accounts.push(account);
		for (const personaName of personasParams[account.name]) {
			const {persona, spaces} = unwrap(
				await createAccountPersonaService.perform({
					params: {name: personaName},
					account_id: account.account_id,
					repos: db.repos,
					session,
				}),
			);

			log.trace('created persona', persona);
			personas.push(persona);
			await createDefaultEntities(db, spaces, [persona]);
		}
	}

	const mainAccountCreator = accounts[0];
	const mainPersonaCreator = personas[0];
	const otherPersonas = personas.slice(1);

	const communitiesParams: CreateCommunityParams[] = [
		{name: 'felt', persona_id: mainPersonaCreator.persona_id},
		{name: 'dev', persona_id: mainPersonaCreator.persona_id},
		{name: 'backpackers-anonymous', persona_id: mainPersonaCreator.persona_id},
	];
	const communities: Community[] = [];

	for (const communityParams of communitiesParams) {
		const {community, spaces} = unwrap(
			await createCommunityService.perform({
				params: {name: communityParams.name, persona_id: communityParams.persona_id},
				account_id: mainAccountCreator.account_id,
				repos: db.repos,
				session,
			}),
		);
		communities.push(community);
		for (const persona of otherPersonas) {
			await db.repos.membership.create(persona.persona_id, community.community_id);
		}
		await createDefaultEntities(db, spaces, personas);
	}
};

const createDefaultEntities = async (db: Database, spaces: Space[], personas: Persona[]) => {
	let personaIndex = -1;
	const nextPersona = (): Persona => {
		personaIndex++;
		if (personaIndex === personas.length) personaIndex = 0;
		return personas[personaIndex];
	};

	for (const space of spaces) {
		const componentName = findFirstComponentName(space.view);
		if (componentName === 'Todo') {
			await generateTodo(db, nextPersona().persona_id, space.space_id);
		}
		if (!componentName || !(componentName in entitiesContents)) {
			continue;
		}
		const entityContents = entitiesContents[componentName];
		for (const entityContent of entityContents) {
			unwrap(
				await db.repos.entity.create(
					nextPersona().persona_id,
					{type: 'Note', content: entityContent},
					space.space_id,
				),
			);
		}
	}
};

const entitiesContents: Record<string, string[]> = {
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

const generateTodo = async (db: Database, persona_id: number, space_id: number) => {
	const list = unwrap(
		await db.repos.entity.create(
			persona_id,
			{
				type: 'Collection',
				name: 'Grocery List',
			},
			space_id,
		),
	);
	const itemsContents = ['eggs', 'milk', 'bread'];
	for (const content of itemsContents) {
		const item = unwrap(
			await db.repos.entity.create(
				persona_id,
				{
					type: 'Note',
					content,
				},
				space_id,
			),
		);
		unwrap(await db.repos.tie.create(list.entity_id, item.entity_id, 'HasItem'));
	}
};

const findFirstComponentName = (view: ViewData): string | undefined => {
	let result: string | undefined;
	traverse(view, (key, value, obj) => {
		if (result) return; // TODO maybe change the `traverse` API to allow stopping?
		if (key === 'type' && value === 'svelteComponent') {
			result = obj.tagName;
		}
	});
	return result;
};
