import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

// TODO generate the type from the schema with json-schema-to-typescript
const create_persona_params_type = '{name: string}';
const create_persona_response_type = '{persona: Persona; community: Community}';
export const create_persona: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_persona',
	params: {
		type: create_persona_params_type,
		schema: {
			$id: 'https://felt.social/vocab/create_persona_params.json',
			type: 'object',
			properties: {
				name: {type: 'string'},
			},
			required: ['name'],
			additionalProperties: false,
		},
	},
	response: {
		type: `ApiResult<${create_persona_response_type}>`,
		schema: {
			$id: 'https://felt.social/vocab/create_persona_response.json',
			type: 'object',
			properties: {
				persona: {$ref: 'Persona.json'},
				community: {$ref: 'Community.json'},
			},
			required: ['persona', 'community'],
			additionalProperties: false,
		},
	},
	returns: `Promise<ApiResult<${create_persona_response_type}>>`,
	route: {
		path: '/api/v1/personas',
		method: 'POST',
	},
};

export const events: EventInfo[] = [create_persona];
