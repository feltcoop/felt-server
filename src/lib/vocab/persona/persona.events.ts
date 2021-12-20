import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const CreatePersona: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreatePersona',
	params: {
		$id: 'https://felt.social/vocab/CreatePersonaParams.json',
		type: 'object',
		properties: {
			name: {type: 'string'},
		},
		required: ['name'],
		additionalProperties: false,
	},
	response: {
		$id: 'https://felt.social/vocab/CreatePersonaResponse.json',
		type: 'object',
		properties: {
			persona: {$ref: 'Persona.json', tsType: 'Persona'},
			community: {$ref: 'Community.json', tsType: 'Community'},
		},
		required: ['persona', 'community'],
		additionalProperties: false,
	},
	returns: 'Promise<CreatePersonaResponseResult>',
	route: {
		path: '/api/v1/personas',
		method: 'POST',
	},
};

export const events: EventInfo[] = [CreatePersona];
