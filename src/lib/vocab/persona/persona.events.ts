import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const CreatePersona: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreatePersona',
	params: {
		$id: '/schemas/CreatePersonaParams.json',
		type: 'object',
		properties: {
			name: {type: 'string'},
		},
		required: ['name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreatePersonaResponse.json',
		type: 'object',
		properties: {
			persona: {$ref: '/schemas/Persona.json', tsType: 'Persona'},
			community: {$ref: '/schemas/Community.json', tsType: 'Community'},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
		},
		required: ['persona', 'community', 'spaces'],
		additionalProperties: false,
	},
	returns: 'Promise<CreatePersonaResponseResult>',
	route: {
		path: '/api/v1/personas',
		method: 'POST',
	},
};

export const events: EventInfo[] = [CreatePersona];
