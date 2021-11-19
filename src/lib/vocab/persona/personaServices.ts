import type {Service} from '$lib/server/service';
import type {CreatePersonaParams, CreatePersonaResponseResult} from '$lib/app/eventTypes';
import {create_persona} from '$lib/vocab/persona/persona.events';

//Creates a new persona
export const createPersonaService: Service<CreatePersonaParams, CreatePersonaResponseResult> = {
	event: create_persona,
	// TODO verify the `account_id` has permission to modify this persona
	// TODO add `actor_id` and verify it's one of the `account_id`'s personas
	perform: async ({server, params, account_id}) => {
		const {db} = server;

		console.log('[create_persona] creating persona', params.name);
		const name = params.name.trim();

		console.log('[create_persona] validating persona uniqueness', name);
		const findByNameResult = await db.repos.persona.findByName(name);

		if (!findByNameResult.ok) {
			console.log('[create_persona] error validating unique name for new persona');
			return {ok: false, status: 500, reason: 'error validating unique name for new persona'};
		}

		if (findByNameResult.value) {
			console.log('[create_persona] provided name for persona already exists');
			return {ok: false, status: 409, reason: 'a persona with that name already exists'};
		}

		console.log('[create_persona] creating persona', name);
		const createPersonaResult = await db.repos.persona.create(name, account_id);
		if (createPersonaResult.ok) {
			return {ok: true, status: 200, value: createPersonaResult.value};
		} else {
			console.log('[create_persona] error searching for community personas');
			return {ok: false, status: 500, reason: 'error searching for community personas'};
		}
	},
};
