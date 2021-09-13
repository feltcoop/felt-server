import type {Service} from '$lib/server/service';
import type {Persona} from '$lib/vocab/persona/persona';
import {PersonaParamsSchema} from '$lib/vocab/persona/persona';
import type {Community} from '$lib/vocab/community/community';

const CreatePersonaServiceSchema = PersonaParamsSchema;

//Creates a new persona
export const createPersonaService: Service<
	typeof CreatePersonaServiceSchema,
	{persona: Persona; community: Community}
> = {
	name: 'create_persona',
	route: {
		path: '/api/v1/communities',
		method: 'post',
	},
	paramsSchema: CreatePersonaServiceSchema,
	// TODO verify the `account_id` has permission to modify this persona
	// TODO add `actor_id` and verify it's one of the `account_id`'s personas
	handle: async (server, params, account_id) => {
		const {db} = server;

		console.log('[create_persona] creating persona', params.name);

		// TODO does it make more sense to pass `name` alone, or the whole `params`?
		// this begs the question, should repos use the `__Params` interfaces or not?
		const createPersonaResult = await db.repos.persona.create(params.name, account_id);
		if (createPersonaResult.ok) {
			return {code: 200, data: createPersonaResult.value};
		} else {
			console.log('[create_persona] error searching for community personas');
			return {code: 500, data: {reason: 'error searching for community personas'}};
		}
	},
};
