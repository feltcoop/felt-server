import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

const create_persona_response_type = '{persona: Persona; community: Community}';
export const create_persona: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'create_persona',
	params: {
		schema: {
			$id: 'https://felt.dev/vocab/create_persona_params.json',
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
			$id: 'https://felt.dev/vocab/create_persona_response.json',
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
