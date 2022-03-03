import type {EventInfo, ServiceEventInfo} from '$lib/vocab/event/event';

export const CreateAccountPersona: ServiceEventInfo = {
	type: 'ServiceEvent',
	name: 'CreateAccountPersona',
	params: {
		$id: '/schemas/CreateAccountPersonaParams.json',
		type: 'object',
		properties: {
			name: {type: 'string'},
		},
		required: ['name'],
		additionalProperties: false,
	},
	response: {
		$id: '/schemas/CreateAccountPersonaResponse.json',
		type: 'object',
		properties: {
			persona: {$ref: '/schemas/Persona.json', tsType: 'Persona'},
			community: {$ref: '/schemas/Community.json', tsType: 'Community'},
			spaces: {type: 'array', items: {$ref: '/schemas/Space.json', tsType: 'Space'}},
			membership: {$ref: '/schemas/Membership.json', tsType: 'Membership'},
		},
		required: ['persona', 'community', 'spaces', 'membership'],
		additionalProperties: false,
	},
	returns: 'Promise<CreateAccountPersonaResponseResult>',
	route: {
		path: '/api/v1/personas',
		method: 'POST',
	},
};

export const events: EventInfo[] = [CreateAccountPersona];
