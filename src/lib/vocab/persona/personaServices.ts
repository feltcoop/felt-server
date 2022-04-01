import {blue, gray} from 'kleur/colors';
import {Logger} from '@feltcoop/felt/util/log.js';

import type {Service} from '$lib/server/service';
import type {
	CreateAccountPersonaParams,
	CreateAccountPersonaResponseResult,
} from '$lib/app/eventTypes';
import {CreateAccountPersona} from '$lib/vocab/persona/personaEvents';
import {toDefaultCommunitySettings} from '$lib/vocab/community/community.schema';
import {createDefaultSpaces} from '$lib/vocab/space/spaceServices';

const log = new Logger(gray('[') + blue('personaServices') + gray(']'));

//Creates a new persona
export const createAccountPersonaService: Service<
	CreateAccountPersonaParams,
	CreateAccountPersonaResponseResult
> = {
	event: CreateAccountPersona,
	// TODO verify the `account_id` has permission to modify this persona
	// TODO add `actor_id` and verify it's one of the `account_id`'s personas
	perform: async (serviceRequest) => {
		const {repos, params, account_id} = serviceRequest;
		log.trace('[CreateAccountPersona] creating persona', params.name);
		const name = params.name.trim();

		log.trace('[CreateAccountPersona] validating persona uniqueness', name);
		const findByNameResult = await repos.persona.findByName(name);

		if (!findByNameResult.ok) {
			log.trace('[CreateAccountPersona] error validating unique name for new persona');
			return {ok: false, status: 500, message: 'error validating unique name for new persona'};
		}

		if (findByNameResult.value) {
			log.trace('[CreateAccountPersona] provided name for persona already exists');
			return {ok: false, status: 409, message: 'a persona with that name already exists'};
		}

		const createCommunityResult = await repos.community.create(
			'personal',
			name,
			toDefaultCommunitySettings(name),
		);
		if (!createCommunityResult.ok) {
			return {ok: false, status: 500, message: 'failed to create initial persona community'};
		}
		const community = createCommunityResult.value;

		log.trace('[CreateAccountPersona] creating persona', name);
		const createPersonaResult = await repos.persona.createAccountPersona(
			name,
			account_id,
			community.community_id,
		);
		if (!createPersonaResult.ok) {
			log.trace('[CreateAccountPersona] error searching for community personas');
			return {ok: false, status: 500, message: 'error searching for community personas'};
		}
		const persona = createPersonaResult.value;

		const createDefaultSpaceResult = await createDefaultSpaces(serviceRequest, community);
		if (!createDefaultSpaceResult.ok) {
			log.trace('[CreateCommunity] error creating community default spaces');
			return {
				ok: false,
				status: 500,
				message: 'error creating community default spaces',
			};
		}
		const spaces = createDefaultSpaceResult.value;

		const membershipResult = await repos.membership.create(
			persona.persona_id,
			community.community_id,
		);
		if (!membershipResult.ok) {
			log.trace('[CreateAccountPersona] error creating membership in personal community');
			return {ok: false, status: 500, message: 'error creating membership in personal community'};
		}
		const membership = membershipResult.value;

		return {ok: true, status: 200, value: {persona, community, spaces, membership}};
	},
};
