import {unwrap} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {cyan} from 'kleur/colors';
import {traverse} from '@feltcoop/felt/util/object.js';

import type {Database} from '$lib/db/Database.js';
import type {Account} from '$lib/vocab/account/account.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {Community} from '$lib/vocab/community/community';
import type {CreateCommunityParams, LoginParams} from '$lib/app/eventTypes';
import type {Persona} from '$lib/vocab/persona/persona';
import {parseView, type ViewData} from '$lib/vocab/view/view';
import {CreateAccountPersonaService} from '$lib/vocab/persona/personaServices';
import {CreateCommunityService} from '$lib/vocab/community/communityServices';
import {toServiceRequestMock} from '$lib/util/testHelpers';
import {CreateMembershipService} from '$lib/vocab/membership/membershipServices';
import {CreateEntityService} from '$lib/vocab/entity/entityServices';

/* eslint-disable no-await-in-loop */

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
	const accountsParams: LoginParams[] = [
		{username: 'a', password: 'a'},
		{username: 'b', password: 'b'},
	];
	const personasParams: {[key: string]: string[]} = {
		a: ['alice', 'andy'],
		b: ['betty', 'billy'],
	};
	const accounts: Account[] = [];
	const personas: Persona[] = [];
	for (const accountParams of accountsParams) {
		const account = unwrap(
			await db.repos.account.create(accountParams.username, accountParams.password),
		);
		log.trace('created account', account);
		accounts.push(account);
		for (const personaName of personasParams[account.name]) {
			const {persona, spaces} = unwrap(
				await CreateAccountPersonaService.perform({
					params: {name: personaName},
					...toServiceRequestMock(account.account_id, db),
				}),
			);

			log.trace('created persona', persona);
			personas.push(persona);
			await createDefaultEntities(toServiceRequestMock(account.account_id, db), spaces, [persona]);
		}
	}

	const mainAccountCreator = accounts[0];
	const mainPersonaCreator = personas[0];
	const otherPersonas = personas.slice(1);

	const serviceRequest = toServiceRequestMock(mainAccountCreator.account_id, db);

	const communitiesParams: CreateCommunityParams[] = [
		{name: 'felt', persona_id: mainPersonaCreator.persona_id},
		{name: 'dev', persona_id: mainPersonaCreator.persona_id},
		{name: 'backpackers-anonymous', persona_id: mainPersonaCreator.persona_id},
	];
	const communities: Community[] = [];

	for (const communityParams of communitiesParams) {
		const {community, spaces} = unwrap(
			await CreateCommunityService.perform({
				params: {name: communityParams.name, persona_id: communityParams.persona_id},
				...serviceRequest,
			}),
		);
		communities.push(community);
		for (const persona of otherPersonas) {
			unwrap(
				await CreateMembershipService.perform({
					params: {persona_id: persona.persona_id, community_id: community.community_id},
					...serviceRequest,
				}),
			);
		}
		await createDefaultEntities(serviceRequest, spaces, personas);
	}
};

const createDefaultEntities = async (
	serviceRequest: ReturnType<typeof toServiceRequestMock>,
	spaces: Space[],
	personas: Persona[],
) => {
	let personaIndex = -1;
	const nextPersona = (): Persona => {
		personaIndex++;
		if (personaIndex === personas.length) personaIndex = 0;
		return personas[personaIndex];
	};

	for (const space of spaces) {
		const componentName = findFirstComponentName(parseView(space.view));
		if (componentName === 'Todo') {
			await generateTodo(serviceRequest, nextPersona().persona_id, space);
		}
		if (!componentName || !(componentName in entitiesContents)) {
			continue;
		}
		const entityContents = entitiesContents[componentName];
		for (const entityContent of entityContents) {
			unwrap(
				await CreateEntityService.perform({
					params: {
						persona_id: nextPersona().persona_id,
						data: {type: 'Note', content: entityContent},
						source_id: space.directory_id,
					},
					...serviceRequest,
				}),
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

const generateTodo = async (
	serviceRequest: ReturnType<typeof toServiceRequestMock>,
	persona_id: number,
	space: Space,
) => {
	const list = unwrap(
		await CreateEntityService.perform({
			params: {
				persona_id,
				data: {type: 'Collection', name: 'Grocery List'},
				source_id: space.directory_id,
			},
			...serviceRequest,
		}),
	);
	const itemsContents = ['eggs', 'milk', 'bread'];
	for (const content of itemsContents) {
		unwrap(
			await CreateEntityService.perform({
				params: {
					persona_id,
					data: {type: 'Note', content},
					source_id: list.entity.entity_id,
				},
				...serviceRequest,
			}),
		);
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
