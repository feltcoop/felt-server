import {Type} from '@sinclair/typebox';

import type {Service} from '$lib/server/service';
import {PersonaSchema} from '$lib/vocab/persona/persona';
import {CommunitySchema} from '$lib/vocab/community/community';
import {toValidateSchema} from '$lib/util/ajv';

const CreatePersonaServiceParams = Type.Object(
	{
		name: Type.String(),
	},
	{$id: 'CreatePersonaServiceParams', additionalProperties: false},
);
const CreatePersonaServiceResponse = Type.Object(
	{
		persona: PersonaSchema,
		community: CommunitySchema,
	},
	{$id: 'CreatePersonaServiceResponse', additionalProperties: false},
);

//Creates a new persona
export const createPersonaService: Service<
	typeof CreatePersonaServiceParams,
	typeof CreatePersonaServiceResponse
> = {
	name: 'create_persona',
	route: {
		path: '/api/v1/personas',
		method: 'POST',
	},
	paramsSchema: CreatePersonaServiceParams,
	validateParams: toValidateSchema(CreatePersonaServiceParams),
	responseSchema: CreatePersonaServiceResponse,
	validateResponse: toValidateSchema(CreatePersonaServiceResponse),
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
