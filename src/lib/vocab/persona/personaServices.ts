import type {Service} from '$lib/server/service';
import type {CreatePersonaParams, CreatePersonaResponseResult} from '$lib/app/eventTypes';
import {CreatePersona} from '$lib/vocab/persona/persona.events';

//Creates a new persona
export const createPersonaService: Service<CreatePersonaParams, CreatePersonaResponseResult> = {
	event: CreatePersona,
	// TODO verify the `account_id` has permission to modify this persona
	// TODO add `actor_id` and verify it's one of the `account_id`'s personas
	perform: async ({server, params, account_id}) => {
		const {db} = server;

		console.log('[CreatePersona] creating persona', params.name);
		const name = params.name.trim();

		console.log('[CreatePersona] validating persona uniqueness', name);
		const findByNameResult = await db.repos.persona.findByName(name);

		if (!findByNameResult.ok) {
			console.log('[CreatePersona] error validating unique name for new persona');
			return {ok: false, status: 500, message: 'error validating unique name for new persona'};
		}

		if (findByNameResult.value) {
			console.log('[CreatePersona] provided name for persona already exists');
			return {ok: false, status: 409, message: 'a persona with that name already exists'};
		}

		console.log('[CreatePersona] creating persona', name);
		const createPersonaResult = await db.repos.persona.create('account', name, account_id, null);
		if (createPersonaResult.ok) {
			return {ok: true, status: 200, value: createPersonaResult.value};
		} else {
			console.log('[CreatePersona] error searching for community personas');
			return {ok: false, status: 500, message: 'error searching for community personas'};
		}
	},
};
