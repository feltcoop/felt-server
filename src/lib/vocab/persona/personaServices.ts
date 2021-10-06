import type {Service} from '$lib/server/service';
import type {create_persona_params_type, create_persona_response_type} from '$lib/ui/events';
import {create_persona} from '$lib/vocab/persona/persona.events';

//Creates a new persona
export const createPersonaService: Service<
	create_persona_params_type,
	create_persona_response_type
> = {
	event: create_persona,
	// TODO verify the `account_id` has permission to modify this persona
	// TODO add `actor_id` and verify it's one of the `account_id`'s personas
	perform: async ({server, params, account_id}) => {
		const {db} = server;

		console.log('[create_persona] creating persona', params.name);

		// TODO does it make more sense to pass `name` alone, or the whole `params`?
		// this begs the question, should repos use the `__Params` interfaces or not?
		const createPersonaResult = await db.repos.persona.create(params, account_id);
		if (createPersonaResult.ok) {
			return {ok: true, status: 200, value: createPersonaResult.value};
		} else {
			console.log('[create_persona] error searching for community personas');
			return {ok: false, status: 500, reason: 'error searching for community personas'};
		}
	},
};
