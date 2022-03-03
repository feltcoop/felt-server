import type {Service} from '$lib/server/service';
import type {
	CreateAccountPersonaParams,
	CreateAccountPersonaResponseResult,
} from '$lib/app/eventTypes';
import {CreateAccountPersona} from '$lib/vocab/persona/persona.events';
import {toDefaultCommunitySettings} from '../community/community.schema';

//Creates a new persona
export const createPersonaService: Service<
	CreateAccountPersonaParams,
	CreateAccountPersonaResponseResult
> = {
	event: CreateAccountPersona,
	// TODO verify the `account_id` has permission to modify this persona
	// TODO add `actor_id` and verify it's one of the `account_id`'s personas
	perform: async ({repos, params, account_id}) => {
		console.log('[CreateAccountPersona] creating persona', params.name);
		const name = params.name.trim();

		console.log('[CreateAccountPersona] validating persona uniqueness', name);
		const findByNameResult = await repos.persona.findByName(name);

		if (!findByNameResult.ok) {
			console.log('[CreateAccountPersona] error validating unique name for new persona');
			return {ok: false, status: 500, message: 'error validating unique name for new persona'};
		}

		if (findByNameResult.value) {
			console.log('[CreateAccountPersona] provided name for persona already exists');
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
		const {community, spaces} = createCommunityResult.value;
		console.log('[CreateAccountPersona] creating persona', name);

		const createPersonaResult = await repos.persona.create(
			'account',
			name,
			account_id,
			community.community_id,
		);
		if (!createPersonaResult.ok) {
			console.log('[CreateAccountPersona] error searching for community personas');
			return {ok: false, status: 500, message: 'error searching for community personas'};
		}
		const persona = createPersonaResult.value;

		const membershipResult = await repos.membership.create(
			persona.persona_id,
			community.community_id,
		);
		if (!membershipResult.ok) {
			console.log('[CreateAccountPersona] error creating membership in personal community');
			return {ok: false, status: 500, message: 'error creating membership in personal community'};
		}
		const membership = membershipResult.value;

		return {ok: true, status: 200, value: {persona, community, spaces, membership}};
	},
};
